/**
 * Enhanced CSV validation and import utilities
 * Provides robust validation, duplicate detection, and error reporting
 */

import { logger } from '../lib/logger'
import { supabase } from '../lib/supabase'

import type { CafeRoastery, Coffee } from '../types/data-management'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ValidationError {
  row: number
  field: string
  value: any
  message: string
  severity: 'error' | 'critical'
}

export interface ValidationWarning {
  row: number
  field: string
  message: string
}

export interface ImportResult {
  success: boolean
  imported: number
  updated: number
  skipped: number
  failed: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  duplicates: DuplicateRecord[]
  report: ImportReport
}

export interface DuplicateRecord {
  row: number
  existingId: string
  name: string
  matchType: 'exact' | 'similar' | 'potential'
  confidence: number
}

export interface ImportReport {
  totalRows: number
  processedRows: number
  successRate: number
  processingTime: number
  validationTime: number
  importTime: number
  suggestions: string[]
}

/**
 * Advanced CSV parser that handles complex formats
 */
export function parseCSVAdvanced(text: string): { headers: string[]; rows: any[] } {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '')
  
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false
  
  // Handle multi-line fields within quotes
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine)
      }
      currentLine = ''
    } else {
      currentLine += char
    }
  }
  
  // Add last line if exists
  if (currentLine.trim()) {
    lines.push(currentLine)
  }
  
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  
  // Parse rows
  const rows: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: any = { _rowNumber: i + 1 }
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || null
    })
    
    rows.push(row)
  }
  
  return { headers, rows }
}

/**
 * Parse a single CSV line handling quotes and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result.map(v => v.replace(/^"(.*)"$/, '$1')) // Remove surrounding quotes
}

/**
 * Validate cafe/roastery data with comprehensive checks
 */
export async function validateCafeRoasteryData(
  rows: any[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: string[] = []
  
  // Check for existing records
  const { data: existingRecords } = await supabase
    .from('cafe_roasteries')
    .select('id, name, address, phone, website')
  
  const existingByName = new Map(existingRecords?.map(r => [r.name.toLowerCase(), r]) || [])
  const existingByAddress = new Map(existingRecords?.map(r => [r.address?.toLowerCase(), r]) || [])
  
  // Validate each row
  for (const row of rows) {
    const rowNum = row._rowNumber
    
    // Required field validation
    if (!row.name || !row.이름) {
      errors.push({
        row: rowNum,
        field: 'name',
        value: null,
        message: '이름은 필수 항목입니다',
        severity: 'error'
      })
    }
    
    if (!row.type && !row.타입) {
      errors.push({
        row: rowNum,
        field: 'type',
        value: null,
        message: '타입은 필수 항목입니다 (cafe, roastery, both)',
        severity: 'error'
      })
    }
    
    if (!row.address && !row.주소) {
      errors.push({
        row: rowNum,
        field: 'address',
        value: null,
        message: '주소는 필수 항목입니다',
        severity: 'error'
      })
    }
    
    // Type validation
    const type = row.type || row.타입
    if (type && !['cafe', 'roastery', 'both', '카페', '로스터리', '둘다'].includes(type.toLowerCase())) {
      errors.push({
        row: rowNum,
        field: 'type',
        value: type,
        message: '유효하지 않은 타입입니다',
        severity: 'error'
      })
    }
    
    // Duplicate detection
    const name = (row.name || row.이름)?.toLowerCase()
    if (name && existingByName.has(name)) {
      warnings.push({
        row: rowNum,
        field: 'name',
        message: `'${row.name || row.이름}'는 이미 존재하는 이름입니다`
      })
    }
    
    // Phone number validation
    const phone = row.phone || row.전화번호
    if (phone && !isValidPhoneNumber(phone)) {
      warnings.push({
        row: rowNum,
        field: 'phone',
        message: '전화번호 형식이 올바르지 않습니다'
      })
    }
    
    // Website validation
    const website = row.website || row.웹사이트
    if (website && !isValidURL(website)) {
      warnings.push({
        row: rowNum,
        field: 'website',
        message: 'URL 형식이 올바르지 않습니다'
      })
    }
    
    // Instagram validation
    const instagram = row.instagram || row.인스타그램 || row.social_instagram
    if (instagram && !isValidInstagram(instagram)) {
      warnings.push({
        row: rowNum,
        field: 'instagram',
        message: '인스타그램 형식이 올바르지 않습니다 (@username)'
      })
    }
  }
  
  // Generate suggestions
  if (errors.length > 0) {
    suggestions.push(`${errors.length}개의 오류를 수정해주세요`)
  }
  
  if (warnings.length > 0) {
    suggestions.push(`${warnings.length}개의 경고가 있습니다. 확인 후 진행해주세요`)
  }
  
  const duplicateCount = warnings.filter(w => w.message.includes('이미 존재')).length
  if (duplicateCount > 0) {
    suggestions.push(`${duplicateCount}개의 중복 항목이 발견되었습니다. 업데이트하려면 '기존 데이터 업데이트' 옵션을 선택하세요`)
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Smart duplicate detection with fuzzy matching
 */
export async function detectDuplicates(
  rows: any[],
  tableName: 'cafe_roasteries' | 'coffees'
): Promise<DuplicateRecord[]> {
  const duplicates: DuplicateRecord[] = []
  
  // Fetch existing records
  const { data: existingRecords } = await supabase
    .from(tableName)
    .select('id, name, address, roastery_id')
  
  if (!existingRecords) return duplicates
  
  for (const row of rows) {
    const rowNum = row._rowNumber
    const name = (row.name || row.이름)?.toLowerCase()
    
    if (!name) continue
    
    // Exact match
    const exactMatch = existingRecords.find(
      r => r.name.toLowerCase() === name
    )
    
    if (exactMatch) {
      duplicates.push({
        row: rowNum,
        existingId: exactMatch.id,
        name: row.name || row.이름,
        matchType: 'exact',
        confidence: 100
      })
      continue
    }
    
    // Similar match (Levenshtein distance)
    for (const existing of existingRecords) {
      const similarity = calculateSimilarity(name, existing.name.toLowerCase())
      
      if (similarity > 0.8) {
        duplicates.push({
          row: rowNum,
          existingId: existing.id,
          name: row.name || row.이름,
          matchType: similarity > 0.9 ? 'similar' : 'potential',
          confidence: Math.round(similarity * 100)
        })
      }
    }
  }
  
  return duplicates
}

/**
 * Enhanced import with validation and duplicate handling
 */
export async function importWithValidation(
  file: File,
  options: {
    type: 'cafe_roasteries' | 'coffees'
    updateExisting?: boolean
    skipDuplicates?: boolean
    validateOnly?: boolean
  }
): Promise<ImportResult> {
  const startTime = Date.now()
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  let imported = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  
  try {
    // Parse CSV
    const text = await file.text()
    const { headers, rows } = parseCSVAdvanced(text)
    
    if (rows.length === 0) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [{
          row: 0,
          field: 'file',
          value: file.name,
          message: 'CSV 파일이 비어있습니다',
          severity: 'critical'
        }],
        warnings: [],
        duplicates: [],
        report: {
          totalRows: 0,
          processedRows: 0,
          successRate: 0,
          processingTime: Date.now() - startTime,
          validationTime: 0,
          importTime: 0,
          suggestions: ['유효한 CSV 파일을 업로드해주세요']
        }
      }
    }
    
    // Validation phase
    const validationStart = Date.now()
    const validation = options.type === 'cafe_roasteries' 
      ? await validateCafeRoasteryData(rows)
      : await validateCoffeeData(rows)
    
    errors.push(...validation.errors)
    warnings.push(...validation.warnings)
    
    const validationTime = Date.now() - validationStart
    
    // Duplicate detection
    const duplicates = await detectDuplicates(rows, options.type)
    
    // If validation only, return results
    if (options.validateOnly) {
      return {
        success: validation.isValid,
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors,
        warnings,
        duplicates,
        report: {
          totalRows: rows.length,
          processedRows: 0,
          successRate: 0,
          processingTime: Date.now() - startTime,
          validationTime,
          importTime: 0,
          suggestions: validation.suggestions
        }
      }
    }
    
    // Import phase
    const importStart = Date.now()
    const validRows = rows.filter(row => {
      const rowErrors = errors.filter(e => e.row === row._rowNumber && e.severity === 'error')
      const isDuplicate = duplicates.some(d => d.row === row._rowNumber && d.matchType === 'exact')
      
      if (rowErrors.length > 0) {
        failed++
        return false
      }
      
      if (isDuplicate) {
        if (options.skipDuplicates) {
          skipped++
          return false
        } else if (options.updateExisting) {
          // Will be handled separately
          return true
        }
      }
      
      return true
    })
    
    // Batch import/update
    if (validRows.length > 0) {
      const batchSize = 100
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize)
        const transformedBatch = options.type === 'cafe_roasteries'
          ? transformCafeRoasteryRows(batch)
          : transformCoffeeRows(batch)
        
        if (options.updateExisting) {
          const { data, error } = await supabase
            .from(options.type)
            .upsert(transformedBatch, {
              onConflict: 'name,address',
              ignoreDuplicates: false
            })
            .select()
          
          if (error) {
            logger.error(`Batch import error`, { error, batch: i })
            errors.push({
              row: 0,
              field: 'database',
              value: null,
              message: error.message,
              severity: 'critical'
            })
          } else {
            const updateCount = duplicates.filter(d => 
              batch.some(b => b._rowNumber === d.row)
            ).length
            
            updated += updateCount
            imported += (data?.length || 0) - updateCount
          }
        } else {
          const { data, error } = await supabase
            .from(options.type)
            .insert(transformedBatch)
            .select()
          
          if (error) {
            logger.error(`Batch import error`, { error, batch: i })
            errors.push({
              row: 0,
              field: 'database',
              value: null,
              message: error.message,
              severity: 'critical'
            })
          } else {
            imported += data?.length || 0
          }
        }
      }
    }
    
    const importTime = Date.now() - importStart
    
    // Log the operation
    await supabase.from('data_update_logs').insert({
      update_type: 'csv_import',
      source: 'admin_upload',
      records_affected: imported + updated,
      details: {
        file_name: file.name,
        total_rows: rows.length,
        imported,
        updated,
        skipped,
        failed,
        errors: errors.length,
        warnings: warnings.length,
        duplicates: duplicates.length,
        processing_time: Date.now() - startTime
      }
    })
    
    const successRate = rows.length > 0 
      ? ((imported + updated) / rows.length) * 100 
      : 0
    
    return {
      success: errors.filter(e => e.severity === 'critical').length === 0,
      imported,
      updated,
      skipped,
      failed,
      errors,
      warnings,
      duplicates,
      report: {
        totalRows: rows.length,
        processedRows: imported + updated + skipped + failed,
        successRate,
        processingTime: Date.now() - startTime,
        validationTime,
        importTime,
        suggestions: generateImportSuggestions(imported, updated, skipped, failed, rows.length)
      }
    }
    
  } catch (error) {
    logger.error('Import failed', { error })
    
    return {
      success: false,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: rows?.length || 0,
      errors: [{
        row: 0,
        field: 'system',
        value: null,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        severity: 'critical'
      }],
      warnings: [],
      duplicates: [],
      report: {
        totalRows: 0,
        processedRows: 0,
        successRate: 0,
        processingTime: Date.now() - startTime,
        validationTime: 0,
        importTime: 0,
        suggestions: ['시스템 오류가 발생했습니다. 다시 시도해주세요']
      }
    }
  }
}

// Helper functions

function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^\d-]/g, '')
  return /^(\d{2,3}-?\d{3,4}-?\d{4})$/.test(cleaned)
}

function isValidURL(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

function isValidInstagram(instagram: string): boolean {
  return /^@?[a-zA-Z0-9_.]+$/.test(instagram)
}

function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return maxLen === 0 ? 1 : 1 - distance / maxLen
}

function transformCafeRoasteryRows(rows: any[]): Partial<CafeRoastery>[] {
  return rows.map(row => ({
    name: row.name || row.이름,
    type: mapCafeType(row.type || row.타입),
    address: row.address || row.주소,
    city: row.city || row.도시 || '서울',
    region: row.region || row.구역 || row.구,
    phone: normalizePhoneNumber(row.phone || row.전화번호),
    website: normalizeURL(row.website || row.웹사이트),
    social_instagram: normalizeInstagram(row.instagram || row.인스타그램 || row.social_instagram),
    social_facebook: row.facebook || row.social_facebook,
    opening_hours: parseOpeningHours(row.opening_hours || row.영업시간),
    features: parseArrayField(row.features || row.특징),
    is_verified: parseBoolean(row.is_verified || row.verified || row.검증),
    lat: parseFloat(row.lat || row.위도) || null,
    lng: parseFloat(row.lng || row.경도) || null
  }))
}

function transformCoffeeRows(rows: any[]): Partial<Coffee>[] {
  return rows.map(row => ({
    name: row.name || row.이름,
    roastery_id: row.roastery_id || null,
    origin: {
      country: row.origin_country || row.원산지,
      region: row.origin_region || row.지역 || null,
      farm: row.origin_farm || row.농장 || null
    },
    processing: row.processing || row.가공방식,
    roast_level: mapRoastLevel(row.roast_level || row.로스팅레벨),
    flavor_notes: parseArrayField(row.flavor_notes || row.맛노트),
    sca_score: parseFloat(row.sca_score || row.SCA점수) || null,
    price: parseInt(row.price || row.가격) || null,
    weight: row.weight || row.무게 || '200g'
  }))
}

function mapCafeType(type: string): 'cafe' | 'roastery' | 'both' {
  const normalized = type?.toLowerCase()
  if (normalized === '카페' || normalized === 'cafe') return 'cafe'
  if (normalized === '로스터리' || normalized === 'roastery') return 'roastery'
  if (normalized === '둘다' || normalized === 'both') return 'both'
  return 'cafe'
}

function mapRoastLevel(level: string): Coffee['roast_level'] {
  const normalized = level?.toLowerCase()
  if (normalized === '라이트' || normalized === 'light') return 'Light'
  if (normalized === '라이트미디엄' || normalized === 'light-medium') return 'Light-Medium'
  if (normalized === '미디엄' || normalized === 'medium') return 'Medium'
  if (normalized === '미디엄다크' || normalized === 'medium-dark') return 'Medium-Dark'
  if (normalized === '다크' || normalized === 'dark') return 'Dark'
  return 'Medium'
}

function normalizePhoneNumber(phone: string | null): string | null {
  if (!phone) return null
  return phone.replace(/[^\d-]/g, '')
}

function normalizeURL(url: string | null): string | null {
  if (!url) return null
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

function normalizeInstagram(instagram: string | null): string | null {
  if (!instagram) return null
  if (!instagram.startsWith('@')) {
    return `@${instagram}`
  }
  return instagram
}

function parseOpeningHours(hours: string | null): any {
  if (!hours) return null
  try {
    if (hours.startsWith('{')) {
      return JSON.parse(hours)
    }
    return null
  } catch {
    return null
  }
}

function parseArrayField(field: string | null): string[] {
  if (!field) return []
  return field
    .split(/[;,|]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

function parseBoolean(value: string | null): boolean {
  if (!value) return false
  return ['true', 'yes', '1', 'y', '예', '네'].includes(value.toLowerCase())
}

function generateImportSuggestions(
  imported: number,
  updated: number,
  skipped: number,
  failed: number,
  total: number
): string[] {
  const suggestions: string[] = []
  
  if (imported > 0) {
    suggestions.push(`${imported}개의 새로운 데이터가 추가되었습니다`)
  }
  
  if (updated > 0) {
    suggestions.push(`${updated}개의 기존 데이터가 업데이트되었습니다`)
  }
  
  if (skipped > 0) {
    suggestions.push(`${skipped}개의 중복 데이터가 건너뛰어졌습니다`)
  }
  
  if (failed > 0) {
    suggestions.push(`${failed}개의 데이터가 오류로 인해 처리되지 못했습니다`)
  }
  
  const successRate = ((imported + updated) / total) * 100
  if (successRate < 50) {
    suggestions.push('데이터 형식을 확인하고 다시 시도해주세요')
  } else if (successRate < 80) {
    suggestions.push('일부 데이터에 문제가 있습니다. 오류 메시지를 확인해주세요')
  } else if (successRate === 100) {
    suggestions.push('모든 데이터가 성공적으로 처리되었습니다!')
  }
  
  return suggestions
}

// Coffee-specific validation
async function validateCoffeeData(rows: any[]): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: string[] = []
  
  // Get roastery list for validation
  const { data: roasteries } = await supabase
    .from('cafe_roasteries')
    .select('id, name')
    .in('type', ['roastery', 'both'])
  
  const roasteryNames = new Set(roasteries?.map(r => r.name.toLowerCase()) || [])
  
  for (const row of rows) {
    const rowNum = row._rowNumber
    
    // Required fields
    if (!row.name && !row.이름) {
      errors.push({
        row: rowNum,
        field: 'name',
        value: null,
        message: '커피 이름은 필수 항목입니다',
        severity: 'error'
      })
    }
    
    if (!row.roastery && !row.로스터리 && !row.roastery_id) {
      errors.push({
        row: rowNum,
        field: 'roastery',
        value: null,
        message: '로스터리는 필수 항목입니다',
        severity: 'error'
      })
    }
    
    // Roastery validation
    const roasteryName = (row.roastery || row.로스터리)?.toLowerCase()
    if (roasteryName && !roasteryNames.has(roasteryName) && !row.roastery_id) {
      warnings.push({
        row: rowNum,
        field: 'roastery',
        message: `로스터리 '${row.roastery || row.로스터리}'를 찾을 수 없습니다. 먼저 로스터리를 등록해주세요`
      })
    }
    
    // Roast level validation
    const roastLevel = row.roast_level || row.로스팅레벨
    if (roastLevel && !['light', 'light-medium', 'medium', 'medium-dark', 'dark', '라이트', '라이트미디엄', '미디엄', '미디엄다크', '다크'].includes(roastLevel.toLowerCase())) {
      errors.push({
        row: rowNum,
        field: 'roast_level',
        value: roastLevel,
        message: '유효하지 않은 로스팅 레벨입니다',
        severity: 'error'
      })
    }
    
    // SCA score validation
    const scaScore = parseFloat(row.sca_score || row.SCA점수)
    if (scaScore && (scaScore < 60 || scaScore > 100)) {
      warnings.push({
        row: rowNum,
        field: 'sca_score',
        message: 'SCA 점수는 60-100 사이여야 합니다'
      })
    }
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    suggestions
  }
}