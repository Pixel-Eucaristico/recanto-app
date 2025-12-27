import { logoNavbar, menuNavbar, mobileExtraLinksNavbar, authNavbar } from '@/_config/routes_main'

describe('Routes Configuration', () => {
  describe('logoNavbar', () => {
    it('should have correct structure', () => {
      expect(logoNavbar).toHaveProperty('url')
      expect(logoNavbar).toHaveProperty('src')
      expect(logoNavbar).toHaveProperty('alt')
      expect(logoNavbar).toHaveProperty('title')
    })

    it('should have correct values', () => {
      expect(logoNavbar.alt).toBe('logo')
      expect(logoNavbar.title).toBe('Recanto')
      expect(logoNavbar.url).toBe('')
      expect(typeof logoNavbar.src).toBe('string')
    })
  })

  describe('menuNavbar', () => {
    it('should be an array', () => {
      expect(Array.isArray(menuNavbar)).toBe(true)
    })

    it('should have correct number of main menu items', () => {
      expect(menuNavbar.length).toBeGreaterThan(0)
    })

    it('should have "Início" as first item', () => {
      expect(menuNavbar[0]).toEqual({
        title: 'Início',
        url: '/'
      })
    })

    it('should have "Institucional" menu with subitems', () => {
      const institucional = menuNavbar.find(item => item.title === 'Institucional')
      expect(institucional).toBeDefined()
      expect(institucional?.items).toBeDefined()
      expect(Array.isArray(institucional?.items)).toBe(true)
      expect(institucional?.items?.length).toBeGreaterThan(0)
    })

    it('should have "Missão" menu with subitems', () => {
      const missao = menuNavbar.find(item => item.title === 'Missão')
      expect(missao).toBeDefined()
      expect(missao?.items).toBeDefined()
      expect(Array.isArray(missao?.items)).toBe(true)
      expect(missao?.items?.length).toBeGreaterThan(0)
    })

    it('should have "Doações" menu item', () => {
      const doacoes = menuNavbar.find(item => item.title === 'Doações')
      expect(doacoes).toBeDefined()
      expect(doacoes?.url).toBe('/doacoes')
    })

    it('should have "Contato" menu item', () => {
      const contato = menuNavbar.find(item => item.title === 'Contato')
      expect(contato).toBeDefined()
      expect(contato?.url).toBe('/contatos')
    })

    it('should have valid URLs for all menu items', () => {
      menuNavbar.forEach(item => {
        expect(item.url).toBeDefined()
        expect(typeof item.url).toBe('string')
        
        if (item.items) {
          item.items.forEach(subItem => {
            expect(subItem.url).toBeDefined()
            expect(typeof subItem.url).toBe('string')
            expect(subItem.title).toBeDefined()
            expect(subItem.description).toBeDefined()
            expect(subItem.icon).toBeDefined()
          })
        }
      })
    })
  })

  describe('mobileExtraLinksNavbar', () => {
    it('should be an array', () => {
      expect(Array.isArray(mobileExtraLinksNavbar)).toBe(true)
    })

    it('should have correct structure for each item', () => {
      mobileExtraLinksNavbar.forEach(item => {
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('url')
        expect(typeof item.name).toBe('string')
        expect(typeof item.url).toBe('string')
      })
    })
  })

  describe('authNavbar', () => {
    it('should have login and signup properties', () => {
      expect(authNavbar).toHaveProperty('login')
      expect(authNavbar).toHaveProperty('signup')
    })

    it('should have correct structure for login', () => {
      expect(authNavbar.login).toHaveProperty('text')
      expect(authNavbar.login).toHaveProperty('url')
      expect(authNavbar.login.text).toBe('Log in')
    })

    it('should have correct structure for signup', () => {
      expect(authNavbar.signup).toHaveProperty('text')
      expect(authNavbar.signup).toHaveProperty('url')
      expect(authNavbar.signup.text).toBe('Sign up')
    })
  })
})