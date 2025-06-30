import { useQuery } from "@tanstack/react-query";
import { devboxByNameOptions } from "@/lib/sealos/devbox/devbox-query";
import { useSealosStore } from "@/store/sealos-store";

export default function DevboxDetail({ devboxName }: { devboxName: string }) {
  const { currentUser, regionUrl } = useSealosStore();
  useQuery(devboxByNameOptions(currentUser, regionUrl, devboxName));
  // No UI or event handlers, just fetch the data for now
  return null;
}
