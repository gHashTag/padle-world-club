import { Request, Response } from "express";
import { BonusTransactionRepository } from "../../repositories/bonus-transaction-repository";
import { db } from "../../db";
import {
  createBonusTransactionSchema,
  updateBonusTransactionSchema,
  getUserTransactionsSchema,
  getTransactionsByTypeSchema,
  getTransactionsByDateRangeSchema,
  getUserBalanceSchema,
  getBalanceHistorySchema,
  getUserBonusSummarySchema,
  getExpiringBonusesSchema,
  idParamSchema,
} from "../validators/bonus-transactions";

const bonusTransactionRepository = new BonusTransactionRepository(db!);

/**
 * Создать новую бонусную транзакцию
 */
export const createBonusTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createBonusTransactionSchema.parse(req.body);

    // Получаем текущий баланс пользователя для расчета нового баланса
    const currentBalance = await bonusTransactionRepository.getCurrentBalance(validatedData.userId);

    // Рассчитываем новый баланс
    let newBalance: number;
    if (validatedData.transactionType === "earned") {
      newBalance = currentBalance + validatedData.pointsChange;
    } else {
      newBalance = currentBalance - validatedData.pointsChange;

      // Проверяем, что у пользователя достаточно бонусов для списания
      if (newBalance < 0) {
        res.status(400).json({
          error: "Недостаточно бонусных баллов",
          currentBalance,
          requested: validatedData.pointsChange,
        });
        return;
      }
    }

    const transaction = await bonusTransactionRepository.create({
      ...validatedData,
      currentBalanceAfter: newBalance,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error creating bonus transaction:", error);
    res.status(500).json({
      error: "Ошибка при создании бонусной транзакции",
    });
  }
};

/**
 * Получить транзакцию по ID
 */
export const getBonusTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const transaction = await bonusTransactionRepository.findById(id);

    if (!transaction) {
      res.status(404).json({
        error: "Транзакция не найдена",
      });
      return;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error getting bonus transaction:", error);
    res.status(500).json({
      error: "Ошибка при получении транзакции",
    });
  }
};

/**
 * Получить транзакции пользователя
 */
export const getUserBonusTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, limit, offset } = getUserTransactionsSchema.parse({
      ...req.params,
      ...req.query,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    let transactions;
    if (type) {
      transactions = await bonusTransactionRepository.findByUserIdAndType(userId, type, limit, offset);
    } else {
      transactions = await bonusTransactionRepository.findByUserId(userId, limit, offset);
    }

    const totalCount = await bonusTransactionRepository.countByUserId(userId);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting user bonus transactions:", error);
    res.status(500).json({
      error: "Ошибка при получении транзакций пользователя",
    });
  }
};

/**
 * Получить транзакции по типу
 */
export const getBonusTransactionsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, limit, offset } = getTransactionsByTypeSchema.parse({
      ...req.query,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    const transactions = await bonusTransactionRepository.findByType(type, limit, offset);
    const totalCount = await bonusTransactionRepository.count();

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting bonus transactions by type:", error);
    res.status(500).json({
      error: "Ошибка при получении транзакций по типу",
    });
  }
};

/**
 * Получить транзакции за период
 */
export const getBonusTransactionsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, limit, offset } = getTransactionsByDateRangeSchema.parse({
      ...req.query,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    const transactions = await bonusTransactionRepository.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      limit,
      offset
    );

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error("Error getting bonus transactions by date range:", error);
    res.status(500).json({
      error: "Ошибка при получении транзакций за период",
    });
  }
};

/**
 * Получить текущий баланс пользователя
 */
export const getUserBonusBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getUserBalanceSchema.parse(req.params);

    const balance = await bonusTransactionRepository.getCurrentBalance(userId);

    res.json({
      success: true,
      data: {
        userId,
        currentBalance: balance,
      },
    });
  } catch (error) {
    console.error("Error getting user bonus balance:", error);
    res.status(500).json({
      error: "Ошибка при получении баланса пользователя",
    });
  }
};

/**
 * Получить историю баланса пользователя
 */
export const getUserBalanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, limit } = getBalanceHistorySchema.parse({
      ...req.params,
      ...req.query,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });

    const history = await bonusTransactionRepository.getBalanceHistory(userId, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error getting user balance history:", error);
    res.status(500).json({
      error: "Ошибка при получении истории баланса",
    });
  }
};

/**
 * Получить сводку по бонусам пользователя
 */
export const getUserBonusSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getUserBonusSummarySchema.parse(req.params);

    const summary = await bonusTransactionRepository.getUserBonusSummary(userId);

    res.json({
      success: true,
      data: {
        userId,
        ...summary,
      },
    });
  } catch (error) {
    console.error("Error getting user bonus summary:", error);
    res.status(500).json({
      error: "Ошибка при получении сводки по бонусам",
    });
  }
};

/**
 * Получить истекающие бонусы
 */
export const getExpiringBonuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { daysAhead } = getExpiringBonusesSchema.parse({
      ...req.query,
      daysAhead: req.query.daysAhead ? Number(req.query.daysAhead) : undefined,
    });

    const expiringBonuses = await bonusTransactionRepository.findExpiringBonuses(daysAhead);

    res.json({
      success: true,
      data: expiringBonuses,
    });
  } catch (error) {
    console.error("Error getting expiring bonuses:", error);
    res.status(500).json({
      error: "Ошибка при получении истекающих бонусов",
    });
  }
};

/**
 * Получить просроченные бонусы
 */
export const getExpiredBonuses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const expiredBonuses = await bonusTransactionRepository.findExpiredBonuses();

    res.json({
      success: true,
      data: expiredBonuses,
    });
  } catch (error) {
    console.error("Error getting expired bonuses:", error);
    res.status(500).json({
      error: "Ошибка при получении просроченных бонусов",
    });
  }
};

/**
 * Обновить транзакцию
 */
export const updateBonusTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateBonusTransactionSchema.parse(req.body);

    const updatedTransaction = await bonusTransactionRepository.update(id, {
      ...validatedData,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
    });

    if (!updatedTransaction) {
      res.status(404).json({
        error: "Транзакция не найдена",
      });
      return;
    }

    res.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating bonus transaction:", error);
    res.status(500).json({
      error: "Ошибка при обновлении транзакции",
    });
  }
};

/**
 * Удалить транзакцию
 */
export const deleteBonusTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const deleted = await bonusTransactionRepository.delete(id);

    if (!deleted) {
      res.status(404).json({
        error: "Транзакция не найдена",
      });
      return;
    }

    res.json({
      success: true,
      message: "Транзакция успешно удалена",
    });
  } catch (error) {
    console.error("Error deleting bonus transaction:", error);
    res.status(500).json({
      error: "Ошибка при удалении транзакции",
    });
  }
};

/**
 * Получить общую статистику по бонусам
 */
export const getBonusStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await bonusTransactionRepository.getBonusStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting bonus stats:", error);
    res.status(500).json({
      error: "Ошибка при получении статистики по бонусам",
    });
  }
};
