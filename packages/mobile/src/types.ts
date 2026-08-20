/**
 * Mobile Navigation Types.
 */

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  Menu: undefined;
  Cart: undefined;
  Orders: undefined;
};
