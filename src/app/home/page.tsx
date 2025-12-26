'use client';
import Carosello from "@/components/home/Carosello";
import ListaSegnalazioni from "@/components/home/ListaSegnalazioni";
import { useUtenti } from "@/hook/utenteHook";

export default function HomePage() {
  return (
    <>
      <Carosello />
      <ListaSegnalazioni />
    </>
  );
}