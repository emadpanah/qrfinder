import { Types } from "mongoose";

export class AddToCartDto {
    customerToken: string;
    productId: string;
    count: number;
    multiValuesId: string;
    cartItemId?: string;
    langId: string;
  }
  
  export class CheckoutDto {
    customerToken: string;
    addressId: string;
    deliveryPathId: string;
    deliveryDate: string;
    deliveryTimeRange: string;
    paymentId: string;
    refrence: string;
    langId: string;
    couponCode?: string;
    useCredit?: boolean;
    isMerge?: boolean;
    description?: string;
    stateId: string;
    daystart?: number;
  }
  
  export class ConfirmOrderDto {
    refId: string;
    customerToken: string;
  }

  export class CreateCustomerSyncDto {
    shopId: string;
    bodyData: any;
  }
  