export const FOCUS_DURATION=15*60*1000;
export function restoreFocus(raw,now,projectIds){
  try{const session=JSON.parse(raw);if(projectIds.includes(session?.projectId)&&Number.isFinite(session.endsAt)&&session.endsAt>now&&session.endsAt<=now+FOCUS_DURATION)return session;}catch{}
  return null;
}
