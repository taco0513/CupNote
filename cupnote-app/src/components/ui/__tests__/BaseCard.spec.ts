import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '../BaseCard.vue'

describe('BaseCard', () => {
  describe('Rendering', () => {
    it('should render card with default props', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Card content'
        }
      })

      expect(wrapper.find('.base-card').exists()).toBe(true)
      expect(wrapper.find('.card-content').exists()).toBe(true)
      expect(wrapper.text()).toBe('Card content')
      expect(wrapper.classes()).toContain('base-card--padding-medium')
      expect(wrapper.classes()).toContain('base-card--shadow-medium')
      expect(wrapper.classes()).toContain('base-card--radius-medium')
    })

    it('should render with custom padding', () => {
      const wrapper = mount(BaseCard, {
        props: { padding: 'large' },
        slots: { default: 'Large padding card' }
      })

      expect(wrapper.classes()).toContain('base-card--padding-large')
      expect(wrapper.classes()).not.toContain('base-card--padding-medium')
    })

    it('should render with custom shadow', () => {
      const wrapper = mount(BaseCard, {
        props: { shadow: 'small' },
        slots: { default: 'Small shadow card' }
      })

      expect(wrapper.classes()).toContain('base-card--shadow-small')
      expect(wrapper.classes()).not.toContain('base-card--shadow-medium')
    })

    it('should render with custom border radius', () => {
      const wrapper = mount(BaseCard, {
        props: { borderRadius: 'large' },
        slots: { default: 'Large radius card' }
      })

      expect(wrapper.classes()).toContain('base-card--radius-large')
      expect(wrapper.classes()).not.toContain('base-card--radius-medium')
    })

    it('should render all padding options correctly', () => {
      const paddings = ['none', 'small', 'medium', 'large']
      
      paddings.forEach(padding => {
        const wrapper = mount(BaseCard, {
          props: { padding },
          slots: { default: `${padding} padding` }
        })
        
        expect(wrapper.classes()).toContain(`base-card--padding-${padding}`)
      })
    })

    it('should render all shadow options correctly', () => {
      const shadows = ['none', 'small', 'medium', 'large']
      
      shadows.forEach(shadow => {
        const wrapper = mount(BaseCard, {
          props: { shadow },
          slots: { default: `${shadow} shadow` }
        })
        
        expect(wrapper.classes()).toContain(`base-card--shadow-${shadow}`)
      })
    })

    it('should render all border radius options correctly', () => {
      const radii = ['none', 'small', 'medium', 'large']
      
      radii.forEach(borderRadius => {
        const wrapper = mount(BaseCard, {
          props: { borderRadius },
          slots: { default: `${borderRadius} radius` }
        })
        
        expect(wrapper.classes()).toContain(`base-card--radius-${borderRadius}`)
      })
    })
  })

  describe('Hoverable State', () => {
    it('should handle hoverable state', () => {
      const wrapper = mount(BaseCard, {
        props: { hoverable: true },
        slots: { default: 'Hoverable card' }
      })

      expect(wrapper.classes()).toContain('base-card--hoverable')
    })

    it('should not have hoverable class when hoverable is false', () => {
      const wrapper = mount(BaseCard, {
        props: { hoverable: false },
        slots: { default: 'Non-hoverable card' }
      })

      expect(wrapper.classes()).not.toContain('base-card--hoverable')
    })

    it('should handle hoverable with custom styling props', () => {
      const wrapper = mount(BaseCard, {
        props: { 
          hoverable: true,
          padding: 'large',
          shadow: 'small',
          borderRadius: 'large'
        },
        slots: { default: 'Custom hoverable card' }
      })

      expect(wrapper.classes()).toContain('base-card--hoverable')
      expect(wrapper.classes()).toContain('base-card--padding-large')
      expect(wrapper.classes()).toContain('base-card--shadow-small')
      expect(wrapper.classes()).toContain('base-card--radius-large')
    })
  })

  describe('Slots', () => {
    it('should render default slot content', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Main card content'
        }
      })

      expect(wrapper.find('.card-content').text()).toBe('Main card content')
    })

    it('should render header slot when provided', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: 'Card Header',
          default: 'Card content'
        }
      })

      expect(wrapper.find('.card-header').exists()).toBe(true)
      expect(wrapper.find('.card-header').text()).toBe('Card Header')
      expect(wrapper.find('.card-content').text()).toBe('Card content')
    })

    it('should render footer slot when provided', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Card content',
          footer: 'Card Footer'
        }
      })

      expect(wrapper.find('.card-footer').exists()).toBe(true)
      expect(wrapper.find('.card-footer').text()).toBe('Card Footer')
      expect(wrapper.find('.card-content').text()).toBe('Card content')
    })

    it('should render all slots together', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: 'Header Content',
          default: 'Main Content',
          footer: 'Footer Content'
        }
      })

      expect(wrapper.find('.card-header').exists()).toBe(true)
      expect(wrapper.find('.card-content').exists()).toBe(true)
      expect(wrapper.find('.card-footer').exists()).toBe(true)
      
      expect(wrapper.find('.card-header').text()).toBe('Header Content')
      expect(wrapper.find('.card-content').text()).toBe('Main Content')
      expect(wrapper.find('.card-footer').text()).toBe('Footer Content')
    })

    it('should not render header/footer divs when slots are not provided', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Only main content'
        }
      })

      expect(wrapper.find('.card-header').exists()).toBe(false)
      expect(wrapper.find('.card-footer').exists()).toBe(false)
      expect(wrapper.find('.card-content').exists()).toBe(true)
    })

    it('should handle complex slot content', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: '<h2>Complex Header</h2>',
          default: '<p>Paragraph content</p><ul><li>List item</li></ul>',
          footer: '<button>Action Button</button>'
        }
      })

      expect(wrapper.find('.card-header').html()).toContain('<h2>Complex Header</h2>')
      expect(wrapper.find('.card-content').html()).toContain('<p>Paragraph content</p>')
      expect(wrapper.find('.card-content').html()).toContain('<li>List item</li>')
      expect(wrapper.find('.card-footer').html()).toContain('<button>Action Button</button>')
    })
  })

  describe('Combined Props', () => {
    it('should handle all props together', () => {
      const wrapper = mount(BaseCard, {
        props: {
          padding: 'large',
          shadow: 'small',
          borderRadius: 'none',
          hoverable: true
        },
        slots: {
          header: 'Full Props Header',
          default: 'Full Props Content',
          footer: 'Full Props Footer'
        }
      })

      expect(wrapper.classes()).toContain('base-card--padding-large')
      expect(wrapper.classes()).toContain('base-card--shadow-small')
      expect(wrapper.classes()).toContain('base-card--radius-none')
      expect(wrapper.classes()).toContain('base-card--hoverable')
      
      expect(wrapper.find('.card-header').text()).toBe('Full Props Header')
      expect(wrapper.find('.card-content').text()).toBe('Full Props Content')
      expect(wrapper.find('.card-footer').text()).toBe('Full Props Footer')
    })
  })

  describe('Prop Validation', () => {
    it('should accept valid padding values', () => {
      const validPaddings = ['none', 'small', 'medium', 'large']
      
      validPaddings.forEach(padding => {
        expect(() => {
          mount(BaseCard, {
            props: { padding },
            slots: { default: 'Test' }
          })
        }).not.toThrow()
      })
    })

    it('should accept valid shadow values', () => {
      const validShadows = ['none', 'small', 'medium', 'large']
      
      validShadows.forEach(shadow => {
        expect(() => {
          mount(BaseCard, {
            props: { shadow },
            slots: { default: 'Test' }
          })
        }).not.toThrow()
      })
    })

    it('should accept valid borderRadius values', () => {
      const validRadii = ['none', 'small', 'medium', 'large']
      
      validRadii.forEach(borderRadius => {
        expect(() => {
          mount(BaseCard, {
            props: { borderRadius },
            slots: { default: 'Test' }
          })
        }).not.toThrow()
      })
    })
  })

  describe('Structure and Layout', () => {
    it('should have correct DOM structure', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: 'Header',
          default: 'Content',
          footer: 'Footer'
        }
      })

      const card = wrapper.find('.base-card')
      expect(card.exists()).toBe(true)
      
      // Check structure order by class names
      const children = card.element.children
      expect(children[0].className).toContain('card-header')
      expect(children[1].className).toContain('card-content')
      expect(children[2].className).toContain('card-footer')
    })

    it('should maintain structure with missing header', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Content',
          footer: 'Footer'
        }
      })

      const card = wrapper.find('.base-card')
      const children = card.element.children
      expect(children).toHaveLength(2)
      expect(children[0].className).toContain('card-content')
      expect(children[1].className).toContain('card-footer')
    })

    it('should maintain structure with missing footer', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: 'Header',
          default: 'Content'
        }
      })

      const card = wrapper.find('.base-card')
      const children = card.element.children
      expect(children).toHaveLength(2)
      expect(children[0].className).toContain('card-header')
      expect(children[1].className).toContain('card-content')
    })
  })
})