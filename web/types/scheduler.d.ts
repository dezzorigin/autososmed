declare module '@autososmed/scheduler' {
  export function spin(tpl: string, i: number): string;
  export function fanout(args: {
    campaign: {
      id: string;
      caption_template: string;
      target_tenants: string[];
    };
    tenants: {
      id: string;
      nama: string;
      slot_harian: number;
      aktif?: boolean;
    }[];
    platforms?: string[];
  }): {
    entitled: unknown[];
    jobs: {
      id: string;
      tenant: string;
      platform: string;
      slot: number;
      caption: string;
      status: string;
      waktu?: string;
    }[];
  };
  export function dedupe<T>(jobs: T[]): T[];
  export function stagger<T>(jobs: T[], opts?: { startMin?: number; endMin?: number }): T[];
  export function checkPipeline(
    pipeline: { nodes: string[] },
    need?: string[],
  ): string[];
}
