/**
 * Инициализация Apollo Client для работы с GraphQL
 */

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { config } from "../config";
import { logger, LogType } from "../utils/logger";

// Проверяем наличие URL для подключения к GraphQL API
if (!config.GRAPHQL_ENDPOINT && process.env.NODE_ENV !== "test") {
  logger.warn("GRAPHQL_ENDPOINT не указан. GraphQL API не будет доступен.", {
    type: LogType.SYSTEM,
  });
}

// Создаем HTTP-ссылку для подключения к GraphQL API
const httpLink = config.GRAPHQL_ENDPOINT
  ? new HttpLink({
      uri: config.GRAPHQL_ENDPOINT,
      // Дополнительные настройки, если необходимы
      // credentials: 'include', // для включения cookies
      // headers: { ... } // для добавления заголовков
    })
  : null;

// Создаем обработчик ошибок
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      logger.error("GraphQL error", {
        error: new Error(message),
        type: LogType.ERROR,
        data: {
          locations,
          path,
        },
      });
    });
  }

  if (networkError) {
    logger.error("Network error", {
      error: networkError,
      type: LogType.ERROR,
    });
  }
});

// Создаем middleware для добавления токена авторизации
const authMiddleware = new ApolloLink((operation, forward) => {
  // Здесь можно добавить логику для добавления токена авторизации
  // operation.setContext(({ headers = {} }) => ({
  //   headers: {
  //     ...headers,
  //     authorization: `Bearer ${getToken()}`,
  //   },
  // }));

  return forward(operation);
});

// Инициализируем Apollo Client, если GraphQL endpoint указан
export const apolloClient = httpLink
  ? new ApolloClient({
      link: from([errorLink, authMiddleware, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "network-only",
          errorPolicy: "all",
        },
        query: {
          fetchPolicy: "network-only",
          errorPolicy: "all",
        },
        mutate: {
          errorPolicy: "all",
        },
      },
    })
  : null;

/**
 * Проверяет доступность GraphQL API
 * @returns Promise<boolean> - true, если API доступен, иначе false
 */
export async function testGraphQLConnection(): Promise<boolean> {
  if (!apolloClient) return false;

  try {
    // Простой запрос для проверки соединения
    await apolloClient.query({
      query: /* GraphQL */ `
        query TestConnection {
          __typename
        }
      `,
    });

    logger.info("Соединение с GraphQL API успешно установлено", {
      type: LogType.SYSTEM,
    });
    return true;
  } catch (error) {
    logger.error("Ошибка при подключении к GraphQL API", {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.ERROR,
    });
    return false;
  }
}
