import { streamCandle } from "get-candles";
import {
  ICandle,
  streamBufferToAdvice,
  streamCandleToBuffer
} from "get-indicators";
import { Readable, Transform } from "stream";

export function streamCandlesToItem(): Transform {
  const ts = new Transform({
    transform: async (chunk, encoding, callback) => {
      const candles: ICandle[] = JSON.parse(chunk);
      while (candles.length) {
        const candle = candles.shift();
        ts.push(JSON.stringify(candle));
      }
      callback();
    }
  });
  return ts;
}

export function streamBuffer({
  exchange,
  currency,
  asset,
  period,
  start,
  end,
  indicators
}: any): Readable {
  const rs = streamCandle({
    exchange,
    currency,
    asset,
    period,
    start,
    end
  }); // здесь свечи как массив
  const ts0 = streamCandlesToItem();
  const ts1 = streamCandleToBuffer(indicators);
  rs.pipe(ts0);
  ts0.pipe(ts1);
  return ts1;
}

export function streamAdvice({
  exchange,
  currency,
  asset,
  period,
  start,
  end,
  indicators,
  code
}: any): Readable {
  const rs = streamCandle({
    exchange,
    currency,
    asset,
    period,
    start,
    end
  }); // здесь свечи как массив
  const ts0 = streamCandlesToItem();
  const ts1 = streamCandleToBuffer(indicators);
  const ts2 = streamBufferToAdvice({ code });
  rs.pipe(ts0);
  ts0.pipe(ts1);
  ts1.pipe(ts2);
  return ts2;
}
