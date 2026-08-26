/**
 * 常量。
 *
 * 常量定义标准文档规范，所有开发将遵守此规范。
 *
 * @remarks
 * 兜底默认值，函数内可作为回退结果使用，避免“未使用”警告。
 * @readonly
 * @public
 * @since 1.0.0
 */
export const CONSTANTS: DataModel = {
  field1: '常量1',
  field2: true,
} as const satisfies DataModel;

/**
 * 数据模型。
 *
 * 数据模型定义标准文档规范，所有开发将遵守此规范。
 *
 * @remarks
 * 补充说明（备注/注意事项）。
 * @public
 @since 1.0.0
 */
export interface DataModel {
  /** 参数一。 */
  field1: string;

  /** 参数二。 */
  field2: boolean;
}

/**
 * 函数。
 *
 * 函数定义标准文档规范，所有开发将遵守此规范。
 *
 * @template T - 返回结果类型，默认值为 DataModel，且必须满足 DataModel 的结构。
 * @param param1 - 参数一说明。
 * @param param2 - 参数二说明（用于构造返回值）。
 * @returns 返回 `Promise<T>`，`await` 后得到 `T`。
 * @throws {TypeError} 当 `param1` 无效时抛出。
 * @throws {RangeError} 当 `param2` 范围非法时抛出。
 * @throws {Error} 当鉴权失败、查询异常或其他运行时错误时抛出。
 * @remarks
 * 使用 `CONSTANTS` 作为默认回退值，避免未使用声明警告。
 * @public
 * @since 1.0.0
 */
async function getDataModels<T extends DataModel = DataModel>(param1: string, param2: boolean): Promise<T> {
  if (!param1) {
    throw new TypeError('param1 is required.');
  }

  const result = param2 ? CONSTANTS : { field1: param1, field2: false };

  return result as T;
}


export { getDataModels };
