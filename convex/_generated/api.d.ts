/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as buyers from "../buyers.js";
import type * as constant from "../constant.js";
import type * as discountCodes from "../discountCodes.js";
import type * as events from "../events.js";
import type * as storage from "../storage.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as waitingList from "../waitingList.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  buyers: typeof buyers;
  constant: typeof constant;
  discountCodes: typeof discountCodes;
  events: typeof events;
  storage: typeof storage;
  ticketTypes: typeof ticketTypes;
  tickets: typeof tickets;
  users: typeof users;
  waitingList: typeof waitingList;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
