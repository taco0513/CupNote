'use client'

import { useState, useRef, useEffect } from 'react'

interface MultiTagSearchProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  allAvailableTags?: string[]
}

export default function MultiTagSearch({
  tags,
  onTagsChange,
  placeholder = '태그 입력 후 Enter',
  allAvailableTags = [],
}: MultiTagSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputValue && allAvailableTags.length > 0) {
      const filtered = allAvailableTags
        .filter(tag => !tags.includes(tag))
        .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, tags, allAvailableTags])

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    onTagsChange(newTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      handleRemoveTag(tags.length - 1)
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-coffee-500 focus-within:border-coffee-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-coffee-100 text-coffee-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              className="ml-1 text-coffee-600 hover:text-coffee-800"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-2 py-1 outline-none"
        />
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}