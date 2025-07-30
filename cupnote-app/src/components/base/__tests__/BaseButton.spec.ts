import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  describe('Rendering', () => {
    it('should render button with default props', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click me'
        }
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toBe('Click me')
      expect(wrapper.classes()).toContain('base-button')
      expect(wrapper.classes()).toContain('base-button--primary')
      expect(wrapper.classes()).toContain('base-button--medium')
    })

    it('should render with custom variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'secondary' },
        slots: { default: 'Secondary Button' }
      })

      expect(wrapper.classes()).toContain('base-button--secondary')
      expect(wrapper.classes()).not.toContain('base-button--primary')
    })

    it('should render with custom size', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'large' },
        slots: { default: 'Large Button' }
      })

      expect(wrapper.classes()).toContain('base-button--large')
      expect(wrapper.classes()).not.toContain('base-button--medium')
    })

    it('should render all variants correctly', () => {
      const variants = ['primary', 'secondary', 'outline', 'text']
      
      variants.forEach(variant => {
        const wrapper = mount(BaseButton, {
          props: { variant },
          slots: { default: `${variant} button` }
        })
        
        expect(wrapper.classes()).toContain(`base-button--${variant}`)
      })
    })

    it('should render all sizes correctly', () => {
      const sizes = ['small', 'medium', 'large']
      
      sizes.forEach(size => {
        const wrapper = mount(BaseButton, {
          props: { size },
          slots: { default: `${size} button` }
        })
        
        expect(wrapper.classes()).toContain(`base-button--${size}`)
      })
    })
  })

  describe('States', () => {
    it('should handle disabled state', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' }
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('base-button--disabled')
    })

    it('should handle loading state', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading Button' }
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('base-button--loading')
      expect(wrapper.classes()).toContain('base-button--disabled')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').text()).toBe('⏳')
    })

    it('should handle full width state', () => {
      const wrapper = mount(BaseButton, {
        props: { fullWidth: true },
        slots: { default: 'Full Width Button' }
      })

      expect(wrapper.classes()).toContain('base-button--full-width')
    })

    it('should combine multiple states correctly', () => {
      const wrapper = mount(BaseButton, {
        props: { 
          variant: 'secondary',
          size: 'large',
          disabled: true,
          fullWidth: true
        },
        slots: { default: 'Combined States' }
      })

      expect(wrapper.classes()).toContain('base-button--secondary')
      expect(wrapper.classes()).toContain('base-button--large')
      expect(wrapper.classes()).toContain('base-button--disabled')
      expect(wrapper.classes()).toContain('base-button--full-width')
    })
  })

  describe('Events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Clickable Button' }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should not emit click when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should not emit click when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading Button' }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should pass event object to click handler', async () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Event Button' }
      })

      await wrapper.find('button').trigger('click')

      const clickEvents = wrapper.emitted('click')
      expect(clickEvents).toBeTruthy()
      expect(clickEvents![0]).toHaveLength(1)
      expect(clickEvents![0][0]).toBeInstanceOf(Event)
    })
  })

  describe('Accessibility', () => {
    it('should have proper button semantics', () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Accessible Button' }
      })

      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.element.type).toBe('submit') // Default button type
    })

    it('should handle disabled attribute correctly', () => {
      const enabledWrapper = mount(BaseButton, {
        props: { disabled: false },
        slots: { default: 'Enabled' }
      })

      const disabledWrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' }
      })

      expect(enabledWrapper.find('button').attributes('disabled')).toBeUndefined()
      expect(disabledWrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('Prop Validation', () => {
    it('should accept valid variant values', () => {
      const validVariants = ['primary', 'secondary', 'outline', 'text']
      
      validVariants.forEach(variant => {
        expect(() => {
          mount(BaseButton, {
            props: { variant },
            slots: { default: 'Test' }
          })
        }).not.toThrow()
      })
    })

    it('should accept valid size values', () => {
      const validSizes = ['small', 'medium', 'large']
      
      validSizes.forEach(size => {
        expect(() => {
          mount(BaseButton, {
            props: { size },
            slots: { default: 'Test' }
          })
        }).not.toThrow()
      })
    })
  })

  describe('Slot Content', () => {
    it('should render slot content when not loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: false },
        slots: { default: 'Button Content' }
      })

      expect(wrapper.text()).toBe('Button Content')
      expect(wrapper.find('.loading-spinner').exists()).toBe(false)
    })

    it('should show loading spinner instead of slot content when loading', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Button Content' }
      })

      expect(wrapper.text()).not.toContain('Button Content')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-spinner').text()).toBe('⏳')
    })

    it('should handle empty slot content', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
    })

    it('should handle complex slot content', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: '<span class="icon">🚀</span> Launch'
        }
      })

      expect(wrapper.html()).toContain('<span class="icon">🚀</span>')
      expect(wrapper.text()).toContain('Launch')
    })
  })
})