import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { HttpException } from '@nestjs/common';
import { Account, Order } from '@prisma/client';

export class AccountHelper {
  public static validateAccountOwnership(
    account: Account | null,
    userId: string
  ): void {
    if (!account) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }
  }

  public static validateAccountHasNoActivities(
    account: Account & { activities?: Order[] }
  ): void {
    if (account?.activities?.length > 0) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }
  }

  public static validateAccountsExist(
    accountFrom: Account | undefined,
    accountTo: Account | undefined
  ): void {
    if (!accountFrom || !accountTo) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.NOT_FOUND),
        StatusCodes.NOT_FOUND
      );
    }
  }

  public static validateTransferAccountsAreDifferent(
    accountFromId: string,
    accountToId: string
  ): void {
    if (accountFromId === accountToId) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.BAD_REQUEST),
        StatusCodes.BAD_REQUEST
      );
    }
  }

  public static validateSufficientBalance(
    accountFrom: Account,
    balance: number
  ): void {
    if (accountFrom.balance < balance) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.BAD_REQUEST),
        StatusCodes.BAD_REQUEST
      );
    }
  }

  public static buildAccountWhereUniqueInput(
    id: string,
    userId: string
  ): { id_userId: { id: string; userId: string } } {
    return {
      id_userId: {
        id,
        userId
      }
    };
  }
}