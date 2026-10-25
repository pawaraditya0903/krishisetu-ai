"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";

export default function FarmerOrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect /farmer/orders to /farmer/products
    router.replace("/farmer/products");
  }, [router]);

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center">
      <Card className="border-stone-200 rounded-2xl p-8 shadow-sm">
        <CardContent className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Redirecting to My Products...</h2>
            <p className="text-xs text-stone-500 mt-1">
              &quot;My Orders&quot; has been upgraded to &quot;My Products&quot; for complete inventory management.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-semibold pt-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your products...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
