"use client";
import { useEffect } from "react";
import { Icon } from "@/components/icon";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <section className="page-container error-page"><span className="error-icon"><Icon name="alert" size={28}/></span><h1>Something didn't load correctly.</h1><p>Please try again. Your work has not been confirmed as submitted.</p><button className="button button-primary" onClick={() => reset()}>Try again <Icon name="arrow" size={16}/></button></section>; }
