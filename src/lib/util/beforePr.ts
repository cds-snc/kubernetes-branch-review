import { saveReleaseToDB } from "../../db/queries";
import { getRefId } from "./getRefId";
import { Request } from "../../interfaces/Request";
import { PrState } from "../../interfaces/Release";

export const isBeforePr = (req: Request): boolean => {
  const body = req.body;
  if (
    body &&
    body.before &&
    body.before === "0000000000000000000000000000000000000000"
  ) {
    console.log("✅ commit prior to PR");
    return true;
  }

  return false;
};

export const beforePr = async (req: Request): Promise<void> => {
  const refId = getRefId(req.body);
  if (refId) {
    await saveReleaseToDB({
      refId,
      sha: req.body.after,
      cluster_id: null,
      pr_state: PrState["none" as PrState]
    });
  }
};
