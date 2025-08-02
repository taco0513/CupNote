/**
 * Test utilities with proper act() wrapper
 */
import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'

// All providers wrapper
export function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Custom render with act wrapper
export function renderWithAct(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  let result: RenderResult

  act(() => {
    result = render(ui, { wrapper: AllTheProviders, ...options })
  })

  return result!
}

// User event with act wrapper
export function setupUserEvent() {
  return userEvent.setup()
}

// Async act wrapper
export async function actAsync(callback: () => Promise<void> | void) {
  await act(async () => {
    await callback()
  })
}

// Wait for with act wrapper
export async function waitForWithAct(callback: () => void, options?: { timeout?: number }) {
  const startTime = Date.now()
  const timeout = options?.timeout || 1000

  while (Date.now() - startTime < timeout) {
    try {
      await actAsync(callback)
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

export * from '@testing-library/react'