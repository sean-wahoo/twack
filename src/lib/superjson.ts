import { Decimal } from "@prisma/client/runtime/client";
// import { Decimal } from "@prisma";
import superjson from "superjson";

superjson.registerCustom<Decimal, number>(
  {
    isApplicable: (v): v is Decimal => v instanceof Decimal,
    serialize: (v) => v.toNumber(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal",
);

export default superjson;
