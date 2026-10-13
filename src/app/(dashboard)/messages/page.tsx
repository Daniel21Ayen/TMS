import { MessagesSquare } from "lucide-react";
export default function Empty() { return <div className="grid h-full place-items-center text-slate-400"><div className="text-center"><MessagesSquare className="mx-auto h-12 w-12" /><p className="mt-2 text-sm">Select a conversation to start chatting.</p></div></div>; }
