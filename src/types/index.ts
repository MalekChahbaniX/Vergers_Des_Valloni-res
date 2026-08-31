export type Palox = {
  _id?: string;
  barcode?: string;
  productId?: string;
  caliber?: string;
  coldRoomId?: string;
  location?: string;
  size?: string;
  fillLevel?: string;
  status?: string;
  dateAdded?: string | Date;
  weight?: number;
};

export type ColdRoom = { _id?: string; name?: string };

export type Product = { _id?: string; name?: string };
