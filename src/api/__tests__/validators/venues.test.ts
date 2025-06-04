/**
 * Тесты для валидаторов площадок
 */

import { describe, it, expect } from 'vitest';
import { VenueValidators } from '../../validators/venues';

describe('VenueValidators', () => {
  describe('createVenueSchema', () => {
    it('должен валидировать корректные данные площадки', () => {
      const validVenue = {
        name: 'Паддл Центр Москва',
        address: 'ул. Примерная, д. 1',
        city: 'Москва',
        country: 'Россия',
        phoneNumber: '+79123456789',
        email: 'info@padel-center.ru',
        isActive: true,
        gCalResourceId: 'calendar-resource-123',
      };

      const result = VenueValidators.createVenue.safeParse(validVenue);
      expect(result.success).toBe(true);
    });

    it('должен валидировать минимальные обязательные поля', () => {
      const minimalVenue = {
        name: 'Центр',
        address: 'Адрес',
        city: 'Город',
        country: 'Страна',
      };

      const result = VenueValidators.createVenue.safeParse(minimalVenue);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пустое название', () => {
      const invalidVenue = {
        name: '',
        address: 'ул. Примерная, д. 1',
        city: 'Москва',
        country: 'Россия',
      };

      const result = VenueValidators.createVenue.safeParse(invalidVenue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('должен отклонять слишком длинное название', () => {
      const invalidVenue = {
        name: 'А'.repeat(256), // превышает лимит в 255 символов
        address: 'ул. Примерная, д. 1',
        city: 'Москва',
        country: 'Россия',
      };

      const result = VenueValidators.createVenue.safeParse(invalidVenue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('должен отклонять некорректный email', () => {
      const invalidVenue = {
        name: 'Паддл Центр',
        address: 'ул. Примерная, д. 1',
        city: 'Москва',
        country: 'Россия',
        email: 'invalid-email',
      };

      const result = VenueValidators.createVenue.safeParse(invalidVenue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('должен отклонять некорректный телефон', () => {
      const invalidVenue = {
        name: 'Паддл Центр',
        address: 'ул. Примерная, д. 1',
        city: 'Москва',
        country: 'Россия',
        phoneNumber: '123', // некорректный формат
      };

      const result = VenueValidators.createVenue.safeParse(invalidVenue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phoneNumber');
      }
    });
  });

  describe('updateVenueSchema', () => {
    it('должен валидировать частичное обновление', () => {
      const updateData = {
        name: 'Новое название',
        isActive: false,
      };

      const result = VenueValidators.updateVenue.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать обновление всех полей', () => {
      const updateData = {
        name: 'Обновленный центр',
        address: 'Новый адрес',
        city: 'Новый город',
        country: 'Новая страна',
        phoneNumber: '+79987654321',
        email: 'new@example.com',
        isActive: false,
        gCalResourceId: 'new-calendar-id',
      };

      const result = VenueValidators.updateVenue.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректные данные при обновлении', () => {
      const updateData = {
        email: 'invalid-email',
      };

      const result = VenueValidators.updateVenue.safeParse(updateData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchVenuesSchema', () => {
    it('должен валидировать базовый поиск', () => {
      const searchData = {
        page: '1',
        limit: '10',
        search: 'центр',
      };

      const result = VenueValidators.searchVenues.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с фильтрами', () => {
      const searchData = {
        page: '1',
        limit: '20',
        city: 'Москва',
        country: 'Россия',
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const result = VenueValidators.searchVenues.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с диапазоном дат', () => {
      const searchData = {
        createdAfter: '2023-01-01T00:00:00Z',
        createdBefore: '2023-12-31T23:59:59Z',
      };

      const result = VenueValidators.searchVenues.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный диапазон дат', () => {
      const searchData = {
        createdAfter: '2023-12-31T23:59:59Z',
        createdBefore: '2023-01-01T00:00:00Z', // после больше до
      };

      const result = VenueValidators.searchVenues.safeParse(searchData);
      expect(result.success).toBe(false);
    });
  });

  describe('venueStatsSchema', () => {
    it('должен валидировать базовую статистику', () => {
      const statsData = {
        period: 'month' as const,
      };

      const result = VenueValidators.venueStats.safeParse(statsData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать статистику с датами', () => {
      const statsData = {
        period: 'week' as const,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-07T23:59:59Z',
        includeBookings: true,
        includeCourts: false,
        includeRevenue: true,
      };

      const result = VenueValidators.venueStats.safeParse(statsData);
      expect(result.success).toBe(true);
    });
  });

  describe('toggleVenueStatusSchema', () => {
    it('должен валидировать изменение статуса', () => {
      const statusData = {
        isActive: false,
        reason: 'Временно закрыт на ремонт',
      };

      const result = VenueValidators.toggleVenueStatus.safeParse(statusData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать изменение статуса без причины', () => {
      const statusData = {
        isActive: true,
      };

      const result = VenueValidators.toggleVenueStatus.safeParse(statusData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять слишком длинную причину', () => {
      const statusData = {
        isActive: false,
        reason: 'А'.repeat(501), // превышает лимит в 500 символов
      };

      const result = VenueValidators.toggleVenueStatus.safeParse(statusData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchVenuesByLocationSchema', () => {
    it('должен валидировать поиск по геолокации', () => {
      const locationData = {
        latitude: 55.7558,
        longitude: 37.6176,
        radius: 5,
        unit: 'km' as const,
      };

      const result = VenueValidators.searchVenuesByLocation.safeParse(locationData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с пагинацией', () => {
      const locationData = {
        latitude: 55.7558,
        longitude: 37.6176,
        radius: 10,
        unit: 'miles' as const,
        page: '1',
        limit: '20',
      };

      const result = VenueValidators.searchVenuesByLocation.safeParse(locationData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректные координаты', () => {
      const locationData = {
        latitude: 91, // превышает допустимый диапазон
        longitude: 37.6176,
      };

      const result = VenueValidators.searchVenuesByLocation.safeParse(locationData);
      expect(result.success).toBe(false);
    });

    it('должен отклонять некорректный радиус', () => {
      const locationData = {
        latitude: 55.7558,
        longitude: 37.6176,
        radius: 0, // слишком маленький
      };

      const result = VenueValidators.searchVenuesByLocation.safeParse(locationData);
      expect(result.success).toBe(false);
    });
  });

  describe('venueParamsSchema', () => {
    it('должен валидировать корректный UUID площадки', () => {
      const params = {
        venueId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = VenueValidators.venueParams.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный UUID', () => {
      const params = {
        venueId: 'invalid-uuid',
      };

      const result = VenueValidators.venueParams.safeParse(params);
      expect(result.success).toBe(false);
    });
  });
});
