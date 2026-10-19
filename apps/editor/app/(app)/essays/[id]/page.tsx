"use client";

// エッセイ編集（/essays/[id]）：保存済みのエッセイを読み込んでエディタに渡す

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { EssayDoc } from "@portfolio/shared";
import { EssayEditor, type EssayEditorInitial } from "@/components/editor/EssayEditor";
import { Card, Spinner } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { firestore } from "@/lib/firebase";

export default function EditEssayPage() {
  const t = useTranslations("essay");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();
  const { user } = useSignedIn();
  const [initial, setInitial] = useState<EssayEditorInitial | null | "notFound">(null);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(firestore(), "users", user.uid, "essays", id))
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot.exists()) {
          setInitial("notFound");
          return;
        }
        const data = snapshot.data() as EssayDoc;
        setInitial({
          id: snapshot.id,
          title: data.title,
          slug: data.slug,
          body: data.body,
          status: data.status,
          publishedAt: data.publishedAt?.toDate() ?? null,
        });
      })
      .catch(() => !cancelled && setInitial("notFound"));
    return () => {
      cancelled = true;
    };
  }, [id, user.uid]);

  if (initial === null) return <Spinner label={tCommon("loading")} />;
  if (initial === "notFound") {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <p className="mb-4">{t("notFound")}</p>
        <Link href="/" className="text-brand hover:underline">
          {t("backToList")}
        </Link>
      </Card>
    );
  }
  // key を付けて、別のエッセイに移ったときにエディタを作り直す
  return <EssayEditor key={initial.id} initial={initial} />;
}
