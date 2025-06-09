/**
 * E2E тест: Полный цикл бронирования корта
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { setupE2ETests, app, authHelper, testDataFactory } from './setup';

// Настройка E2E окружения
setupE2ETests();

describe('E2E: Booking Flow', () => {
  it('должен выполнить полный цикл бронирования корта', async () => {
    // 1. Создание пользователей
    console.log('🔄 Шаг 1: Создание пользователей...');

    const adminData = testDataFactory.createTestUser('admin');
    const playerData = testDataFactory.createTestUser('player');
    const coachData = testDataFactory.createTestUser('coach');

    const { token: adminToken } = await authHelper.registerUser(adminData);
    const { user: player, token: playerToken } = await authHelper.registerUser(playerData);
    const { user: coach, token: coachToken } = await authHelper.registerUser(coachData);

    console.log('✅ Пользователи созданы');

    // 2. Создание площадки и корта
    console.log('🔄 Шаг 2: Создание площадки и корта...');

    const venueData = testDataFactory.createTestVenue();
    const venueResponse = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(venueData)
      .expect(201);

    const venue = venueResponse.body.data;

    const courtData = testDataFactory.createTestCourt(venue.id);
    const courtResponse = await request(app)
      .post('/api/courts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(courtData)
      .expect(201);

    const court = courtResponse.body.data;

    console.log('✅ Площадка и корт созданы');

    // 3. Создание бронирования
    console.log('🔄 Шаг 3: Создание бронирования...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 14:00

    const endTime = new Date(tomorrow);
    endTime.setHours(15, 30, 0, 0); // 15:30 (1.5 часа)

    const bookingData = {
      courtId: court.id,
      bookedByUserId: player.id,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: 90,
      totalAmount: 75.00,
      bookingPurpose: 'free_play',
      notes: 'E2E test booking'
    };

    const createBookingResponse = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${playerToken}`)
      .send(bookingData)
      .expect(201);

    expect(createBookingResponse.body.success).toBe(true);
    expect(createBookingResponse.body.data.status).toBe('pending_payment');

    const booking = createBookingResponse.body.data;
    console.log('✅ Бронирование создано:', booking.id);

    // 4. Получение информации о бронировании
    console.log('🔄 Шаг 4: Получение информации о бронировании...');

    const getBookingResponse = await request(app)
      .get(`/api/bookings/${booking.id}`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(getBookingResponse.body.success).toBe(true);
    expect(getBookingResponse.body.data.id).toBe(booking.id);

    console.log('✅ Информация о бронировании получена');

    // 5. Добавление участников к бронированию
    console.log('🔄 Шаг 5: Добавление участников...');

    const participantData = {
      userId: coach.id,
      role: 'coach',
      notes: 'Professional coach for the session'
    };

    const addParticipantResponse = await request(app)
      .post(`/api/bookings/${booking.id}/participants`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send(participantData)
      .expect(201);

    expect(addParticipantResponse.body.success).toBe(true);

    console.log('✅ Участник добавлен к бронированию');

    // 6. Получение списка участников
    console.log('🔄 Шаг 6: Получение списка участников...');

    const getParticipantsResponse = await request(app)
      .get(`/api/bookings/${booking.id}/participants`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(getParticipantsResponse.body.success).toBe(true);
    expect(getParticipantsResponse.body.data).toHaveLength(1);
    expect(getParticipantsResponse.body.data[0].userId).toBe(coach.id);

    console.log('✅ Список участников получен');

    // 7. Создание платежа для бронирования
    console.log('🔄 Шаг 7: Создание платежа...');

    const paymentData = {
      bookingId: booking.id,
      amount: 75.00,
      currency: 'USD',
      paymentMethod: 'credit_card',
      description: 'Payment for court booking'
    };

    const createPaymentResponse = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${playerToken}`)
      .send(paymentData)
      .expect(201);

    expect(createPaymentResponse.body.success).toBe(true);
    expect(createPaymentResponse.body.data.status).toBe('pending');

    const payment = createPaymentResponse.body.data;
    console.log('✅ Платеж создан:', payment.id);

    // 8. Обновление статуса платежа (имитация обработки)
    console.log('🔄 Шаг 8: Обработка платежа...');

    const updatePaymentResponse = await request(app)
      .put(`/api/payments/${payment.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(updatePaymentResponse.body.success).toBe(true);
    expect(updatePaymentResponse.body.data.status).toBe('completed');

    console.log('✅ Платеж обработан');

    // 9. Подтверждение бронирования
    console.log('🔄 Шаг 9: Подтверждение бронирования...');

    const confirmBookingResponse = await request(app)
      .post(`/api/bookings/${booking.id}/confirm`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        paymentConfirmed: true,
        notes: 'Booking confirmed after payment'
      })
      .expect(200);

    expect(confirmBookingResponse.body.success).toBe(true);
    expect(confirmBookingResponse.body.data.status).toBe('confirmed');

    console.log('✅ Бронирование подтверждено');

    // 10. Получение списка бронирований пользователя
    console.log('🔄 Шаг 10: Получение списка бронирований...');

    const getBookingsResponse = await request(app)
      .get('/api/bookings')
      .query({
        bookedByUserId: player.id,
        status: 'confirmed'
      })
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(getBookingsResponse.body.success).toBe(true);
    expect(getBookingsResponse.body.data.data.some((b: any) => b.id === booking.id)).toBe(true);

    console.log('✅ Список бронирований получен');

    // 11. Проверка доступности корта (должен быть занят)
    console.log('🔄 Шаг 11: Проверка доступности корта...');

    const availabilityResponse = await request(app)
      .get(`/api/courts/${court.id}/availability`)
      .query({
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30'
      })
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(availabilityResponse.body.success).toBe(true);
    // Корт должен быть недоступен в это время
    expect(availabilityResponse.body.data.available).toBe(false);

    console.log('✅ Доступность корта проверена - корт занят');

    console.log('🎉 Полный цикл бронирования завершен успешно!');
  });

  it('должен обработать конфликт времени бронирования', async () => {
    console.log('🔄 Тест: Обработка конфликта времени...');

    // Создание пользователей и инфраструктуры
    const adminData = testDataFactory.createTestUser('admin');
    const player1Data = testDataFactory.createTestUser('player');
    const player2Data = testDataFactory.createTestUser('player');

    const { token: adminToken } = await authHelper.registerUser(adminData);
    const { user: player1, token: player1Token } = await authHelper.registerUser(player1Data);
    const { user: player2, token: player2Token } = await authHelper.registerUser(player2Data);

    const venueData = testDataFactory.createTestVenue();
    const venueResponse = await request(app)
      .post('/api/venues')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(venueData)
      .expect(201);

    const courtData = testDataFactory.createTestCourt(venueResponse.body.data.id);
    const courtResponse = await request(app)
      .post('/api/courts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(courtData)
      .expect(201);

    const court = courtResponse.body.data;

    // Первое бронирование
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(15, 30, 0, 0);

    const booking1Data = {
      courtId: court.id,
      bookedByUserId: player1.id,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: 90,
      totalAmount: 75.00,
      bookingPurpose: 'free_play'
    };

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${player1Token}`)
      .send(booking1Data)
      .expect(201);

    // Попытка создания конфликтующего бронирования
    const conflictingStartTime = new Date(tomorrow);
    conflictingStartTime.setHours(15, 0, 0, 0); // Пересекается с первым

    const conflictingEndTime = new Date(tomorrow);
    conflictingEndTime.setHours(16, 30, 0, 0);

    const booking2Data = {
      courtId: court.id,
      bookedByUserId: player2.id,
      startTime: conflictingStartTime.toISOString(),
      endTime: conflictingEndTime.toISOString(),
      durationMinutes: 90,
      totalAmount: 75.00,
      bookingPurpose: 'free_play'
    };

    const conflictResponse = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${player2Token}`)
      .send(booking2Data)
      .expect(409);

    expect(conflictResponse.body.success).toBe(false);
    expect(conflictResponse.body.message).toContain('недоступен');

    console.log('✅ Конфликт времени обработан корректно');
  });
});
