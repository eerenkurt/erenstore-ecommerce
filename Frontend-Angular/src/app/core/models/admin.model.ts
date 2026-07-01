export interface PendingSeller {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  storeName: string;
  sellerStatus: string;
  createdDate: string;
}

export interface ApproveSellerRequest {
  userId: number;
  isApproved: boolean;
}
