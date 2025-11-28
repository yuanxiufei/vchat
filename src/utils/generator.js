/**
 * 生成一个范围迭代器
 */
let range1 = {
  from: 1,
  to: 9,
  [Symbol.iterator]() {
    // 实现可迭代协议
    return {
      // 实现迭代器协议
      current: this.from, // 迭代器协议属性，记录当前迭代位置
      last: this.to, // 迭代器协议属性，记录迭代结束位置
      next() {
        // 实现迭代器协议方法
        if (this.current <= this.last) {
          // 迭代器协议方法，判断是否迭代结束
          return { done: false, value: this.current++ }; // 迭代器协议方法，返回当前迭代值
        } else {
          return { done: true };
        }
      },
    };
  },
};

// 循环输出，直到迭代器完成
const run1 = () => {
  for (const item of range1) {
    console.log('range1:',item);
  }
};

run1()

console.log('----------------------------分割线---------------------------------')

/**
 * 生成器函数，用于生成一个序列
 * @returns 一个包含1、2、3的迭代器
 */
function* generatorSequence() {
  yield 1;
  yield 2;
  return 3;
}

// 调用生成器函数，获取迭代器
let generator = generatorSequence();


// 循环输出，直到迭代器完成
const run2 = () => {
  for (const item of generator) {
    console.log('generator:',item);
  }
};

run2();

console.log('----------------------------分割线---------------------------------')

let range2 = {
  from: 1,
  to: 9,
  *[Symbol.iterator]() {
    // 实现可迭代协议
    for (let current = this.from; current <= this.to; current++) {
      yield current;
    }
  },
};

// 循环输出，直到迭代器完成
const run3 = () => {
  for (const item of range2) {
    console.log('range2:',item);
  }
};

run3();


console.log('----------------------------分割线---------------------------------')

 /**
  * 生成一个异步范围迭代器
  */
let asyncRange = {
  from: 1,
  to: 9,
  async *[Symbol.asyncIterator]() {
    // 实现可迭代协议
    for (let current = this.from; current <= this.to; current++) {
      await  new Promise(resolve => setTimeout(() => resolve(current), 500));
      yield current;
    }
  },
};


const runAsync = async () => {
  for await (const item of asyncRange) {
    console.log('asyncRange:',item);
  }
};

runAsync();