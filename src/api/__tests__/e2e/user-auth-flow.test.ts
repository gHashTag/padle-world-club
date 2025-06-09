/**
 * E2E тест: Полный цикл регистрации и аутентификации пользователя
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { setupE2ETests, app, testDataFactory } from './setup';

// Настройка E2E окружения
setupE2ETests();

describe('E2E: User Registration and Authentication Flow', () => {
  it('должен выполнить полный цикл регистрации и аутентификации пользователя', async () => {
    // 1. Создание тестового пользователя
    const userData = testDataFactory.createTestUser('player', {
      firstName: 'John',
      lastName: 'Doe'
    });

    console.log('🔄 Шаг 1: Регистрация нового пользователя...');

    // 2. Регистрация пользователя
    const registerResponse = await request(app)
      .post('/api/users/auth/register')
      .send(userData)
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data).toHaveProperty('user');
    expect(registerResponse.body.data).toHaveProperty('token');
    expect(registerResponse.body.data.user.username).toBe(userData.username);
    expect(registerResponse.body.data.user.email).toBe(userData.email);
    expect(registerResponse.body.data.user.userRole).toBe('player');

    const registeredUser = registerResponse.body.data.user;
    const registrationToken = registerResponse.body.data.token;

    console.log('✅ Пользователь успешно зарегистрирован:', registeredUser.username);

    // 3. Проверка, что токен работает для защищенных маршрутов
    console.log('🔄 Шаг 2: Проверка токена регистрации...');

    const protectedResponse = await request(app)
      .get('/api/users/auth/me')
      .set('Authorization', `Bearer ${registrationToken}`)
      .expect(200);

    expect(protectedResponse.body.success).toBe(true);
    expect(protectedResponse.body.data.id).toBe(registeredUser.id);

    console.log('✅ Токен регистрации работает корректно');

    // 4. Выход из системы (логаут)
    console.log('🔄 Шаг 3: Выход из системы...');

    const logoutResponse = await request(app)
      .post('/api/users/auth/logout')
      .set('Authorization', `Bearer ${registrationToken}`)
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);

    console.log('✅ Выход из системы выполнен');

    // 5. Проверка, что старый токен больше не работает (опционально)
    // Примечание: В текущей реализации токены не инвалидируются на сервере
    // Это нормально для JWT токенов без blacklist

    // 6. Повторный вход в систему
    console.log('🔄 Шаг 4: Повторный вход в систему...');

    const loginResponse = await request(app)
      .post('/api/users/auth/login')
      .send({
        username: userData.username,
        password: userData.password
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data).toHaveProperty('user');
    expect(loginResponse.body.data).toHaveProperty('token');
    expect(loginResponse.body.data.user.username).toBe(userData.username);

    const loginToken = loginResponse.body.data.token;

    console.log('✅ Повторный вход выполнен успешно');

    // 7. Проверка нового токена
    console.log('🔄 Шаг 5: Проверка нового токена...');

    const newTokenResponse = await request(app)
      .get('/api/users/auth/me')
      .set('Authorization', `Bearer ${loginToken}`)
      .expect(200);

    expect(newTokenResponse.body.success).toBe(true);
    expect(newTokenResponse.body.data.username).toBe(userData.username);

    console.log('✅ Новый токен работает корректно');

    // 8. Обновление профиля пользователя
    console.log('🔄 Шаг 6: Обновление профиля...');

    const updateData = {
      firstName: 'John Updated',
      lastName: 'Doe Updated'
    };

    const updateResponse = await request(app)
      .put(`/api/users/users/${registeredUser.id}`)
      .set('Authorization', `Bearer ${loginToken}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.firstName).toBe('John Updated');
    expect(updateResponse.body.data.lastName).toBe('Doe Updated');

    console.log('✅ Профиль обновлен успешно');

    // 9. Проверка обновленного профиля
    console.log('🔄 Шаг 7: Проверка обновленного профиля...');

    const updatedProfileResponse = await request(app)
      .get('/api/users/auth/me')
      .set('Authorization', `Bearer ${loginToken}`)
      .expect(200);

    expect(updatedProfileResponse.body.data.firstName).toBe('John Updated');
    expect(updatedProfileResponse.body.data.lastName).toBe('Doe Updated');

    console.log('✅ Обновленный профиль получен корректно');

    console.log('🎉 Полный цикл регистрации и аутентификации завершен успешно!');
  });

  it('должен обработать ошибки при неверных данных входа', async () => {
    console.log('🔄 Тест: Обработка неверных данных входа...');

    // Попытка входа с несуществующим пользователем
    const invalidLoginResponse = await request(app)
      .post('/api/users/auth/login')
      .send({
        username: 'nonexistent_user',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(invalidLoginResponse.body.success).toBe(false);
    // Проверяем, что есть сообщение об ошибке
    expect(invalidLoginResponse.body.error).toBeDefined();

    console.log('✅ Неверные данные входа обработаны корректно');
  });

  it('должен обработать попытку регистрации с дублирующимися данными', async () => {
    console.log('🔄 Тест: Обработка дублирующихся данных регистрации...');

    const userData = testDataFactory.createTestUser('player');

    // Первая регистрация
    await request(app)
      .post('/api/users/auth/register')
      .send(userData)
      .expect(201);

    // Попытка повторной регистрации с тем же username
    const duplicateResponse = await request(app)
      .post('/api/users/auth/register')
      .send(userData)
      .expect(409);

    expect(duplicateResponse.body.success).toBe(false);
    // Проверяем, что есть сообщение об ошибке
    expect(duplicateResponse.body.error).toBeDefined();

    console.log('✅ Дублирующиеся данные обработаны корректно');
  });
});
