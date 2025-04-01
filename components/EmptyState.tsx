"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  actionLink: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionLink,
}: EmptyStateProps) {
  return (
    <Card className="w-full border-dashed border-2">
      <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-10 space-y-6">
        <div className="rounded-full bg-muted p-3">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button asChild>
          <Link href={actionLink}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}