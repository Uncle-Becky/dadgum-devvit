export class DevvitHelper {
  static async storeData(context: any, key: string, value: any): Promise<void> {
    try {
      await context.redis.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  static async getData<T>(context: any, key: string): Promise<T | null> {
    try {
      const data = await context.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  static createMessageHandler(handlers: Record<string, (data: any) => void>) {
    return (event: MessageEvent) => {
      const { type, data } = event.data;
      if (handlers[type]) {
        handlers[type](data);
      }
    };
  }

  static validateMessage(message: any, schema: Record<string, any>): boolean {
    for (const [key, type] of Object.entries(schema)) {
      if (typeof message[key] !== type) {
        console.error(`Invalid message: ${key} should be ${type}`);
        return false;
      }
    }
    return true;
  }
}
