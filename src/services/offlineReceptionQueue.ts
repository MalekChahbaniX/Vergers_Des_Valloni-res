import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { stockAPI } from './api';

export type ReceptionPayload = {
  barcode: string;
  productId: string | null;
  caliber: string | null;
  coldRoomId: string | null;
  location: string | null;
  size: string | null;
  weight: number;
  dateAdded: string;
  userId: string | null;
  roomname: string;
};

const STORAGE_KEY = '@vlaws/reception-queue';
const CONTEXT_KEY = '@vlaws/reception-context';

export type ReceptionContext = {
  palox: Array<{ _id: string; caliber?: string; productId?: string; location?: string; coldRoomId?: string }>;
  coldRooms: Array<{ _id: string; name?: string }>;
  products: Array<{ _id: string; name?: string }>;
};

export const readCachedReceptionContext = async () => {
  try {
    const raw = await AsyncStorage.getItem(CONTEXT_KEY);
    return raw ? (JSON.parse(raw) as ReceptionContext) : null;
  } catch {
    return null;
  }
};

export const writeCachedReceptionContext = async (context: ReceptionContext) => {
  await AsyncStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
};

const readQueue = async (): Promise<ReceptionPayload[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReceptionPayload[]) : [];
  } catch (error) {
    console.warn('Reception queue read failed', error);
    return [];
  }
};

const writeQueue = async (queue: ReceptionPayload[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const getPendingReceptionCount = async () => (await readQueue()).length;

export const enqueueReception = async (payload: ReceptionPayload) => {
  const queue = await readQueue();
  queue.push(payload);
  await writeQueue(queue);
  return queue.length;
};

export const flushReceptionQueue = async () => {
  const network = await NetInfo.fetch();
  if (!network.isConnected) return 0;

  const queue = await readQueue();
  let sent = 0;
  for (const payload of queue) {
    try {
      await stockAPI.addPalox(payload);
      sent += 1;
    } catch (error) {
      console.warn('Reception queue flush stopped', error);
      break;
    }
  }

  if (sent > 0) await writeQueue(queue.slice(sent));
  return sent;
};

export const subscribeToReceptionSync = (onChange: (pending: number) => void) => {
  let disposed = false;
  const update = async () => {
    await flushReceptionQueue();
    if (!disposed) onChange(await getPendingReceptionCount());
  };

  update();
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) update();
  });
  return () => {
    disposed = true;
    unsubscribe();
  };
};
