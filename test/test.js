require("mocha");
const { assert } = require("chai");
const { readFileSync } = require("fs");
const { Readable } = require("stream");
const { streamCandle } = require("get-candles");
const {
  streamAdvice,
  streamCandlesToItem,
  streamBuffer
} = require("../lib/index");

describe("streamCandlesToItem", function() {
  it("streamCandlesToItem", function(done) {
    assert.isFunction(streamCandlesToItem);

    const candles = JSON.parse(readFileSync("./test/data/candles0.json"));

    let i = 0;

    const rs = new Readable({
      read: async () => {
        rs.push(JSON.stringify(candles[0]));
        rs.push(JSON.stringify(candles[1]));
        rs.push(null);
      }
    });

    const ts = streamCandlesToItem();
    rs.pipe(ts);
    ts.on("data", chunk => {
      const candle = JSON.parse(chunk);
      assert.isObject(candle);
      assert.hasAllKeys(candle, [
        "time",
        "open",
        "high",
        "low",
        "close",
        "volume"
      ]);
      assert.isString(candle.time);
      assert.isNumber(candle.open);
      assert.isNumber(candle.high);
      assert.isNumber(candle.low);
      assert.isNumber(candle.close);
      assert.isNumber(candle.volume);
      i++;
    });

    ts.on("finish", () => {
      assert.equal(i, 4);
      done();
    });
  });
});

describe("streamBuffer", function() {
  it("streamBuffer", function(done) {
    this.timeout(5000);
    assert.isFunction(streamBuffer);

    const options = {
      exchange: "hitbtc",
      currency: "USD",
      asset: "BTC",
      period: 60,
      start: "2019-10-01",
      end: "2019-10-02",
      indicators: [
        {
          name: "max",
          options: [2]
        },
        {
          name: "min",
          options: [2]
        }
      ]
    };

    let i = 0;

    const rs = streamBuffer(options);
    rs.on("data", chunk => {
      const buffer = JSON.parse(chunk);
      switch (i) {
        case 0:
          assert.isObject(buffer);
          assert.property(buffer, "indicators");
          assert.isArray(buffer.indicators);
          assert.isNotEmpty(buffer.indicators);
          assert.isArray(buffer.indicators[0]);
          assert.isArray(buffer.indicators[1]);
          break;

        case 1:
          assert.isNotEmpty(buffer.indicators[0]);
          assert.isNotEmpty(buffer.indicators[1]);
          assert.isNumber(buffer.indicators[0][0]);
          assert.isNumber(buffer.indicators[1][0]);
          break;
      }
      i++;
    });

    rs.on("end", () => {
      assert.equal(i, 25);
      done();
    });
  });
});

describe.skip("streamAdvice", function() {
  it("streamAdvice", function(done) {
    assert.isFunction(streamAdvice);

    const options = {
      exchange: "hitbtc",
      currency: "USD",
      asset: "BTC",
      period: 1,
      start: "2019-10-01",
      end: "2019-10-02",
      indicators: [
        {
          name: "max",
          options: [2]
        }
      ],
      code:
        // "return buffer[0].indicators[0][0] > buffer[1].indicators[0][0] ? 1 : -1;"
        "return 1;"
    };

    let i = 0;

    const rs = streamAdvice(options);
    rs.on("data", chunk => {
      const advice = JSON.parse(chunk);
      console.log("advice:", advice);
      // assert.isObject(advice);
      // assert.property(advice, "sign");
      // assert.isNumber(advice.sign);
      // assert.equal(advice.sign, -1);
      i++;
    });

    rs.on("finish", () => {
      console.log(i);
      // assert.equal(i, 1);
      done();
    });
  });
});
