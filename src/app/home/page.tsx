'use client';
import Carosello from "@/components/home/Carosello";
import ListaAvvisi from "@/components/home/ListaAvvisi";
import { useUtenti } from "@/hook/utenteHook";

export default function HomePage() {
  return (
    <>
      <Carosello />
      <ListaAvvisi />
    </>
  );
}