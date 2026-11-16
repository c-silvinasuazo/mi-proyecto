#!/bin/sh
# Runs the Maestro flows in mobile/<app> (default sched-app) on the running emulator or simulator.
# Maestro passes shell variables that start with MAESTRO_ to the flows, so the account for mobile/login goes in that way
# (not as a command-line argument, which other processes can read). The other folders get no account.
set -e
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export MAESTRO_CLI_NO_ANALYTICS=1
app="${1:-sched-app}"
[ $# -gt 0 ] && shift
# The QA event on production the Sched app flows open (public, so the app's search finds it), and what they expect in it.
# Any of these can be set in the shell to point the flows somewhere else.
export MAESTRO_EVENT="${MAESTRO_EVENT:-qa reminders 2}" MAESTRO_ATTENDEE="${MAESTRO_ATTENDEE:-Silvina Suazo}"
export MAESTRO_SESSION="${MAESTRO_SESSION:-qa publico}" MAESTRO_SPEAKER="${MAESTRO_SPEAKER:-qa speaker 2228}"
# When MAESTRO_SESSION starts, as the session page shows it (APP-09), and another session found by one word of its title
# (APP-07). Change them together with the event's data.
export MAESTRO_SESSION_DAY="${MAESTRO_SESSION_DAY:-Wednesday}" MAESTRO_SESSION_DATE="${MAESTRO_SESSION_DATE:-October 21, 2026}"
export MAESTRO_SESSION_START="${MAESTRO_SESSION_START:-10:00}"
export MAESTRO_OTHER_SESSION="${MAESTRO_OTHER_SESSION:-qa capacity}" MAESTRO_OTHER_SESSION_WORD="${MAESTRO_OTHER_SESSION_WORD:-capacity}"
# mobile/login logs the QA account in, so only that folder gets it from .env (SCHED_EMAIL, SCHED_PASSWORD). Run it
# yourself; the logged-in flows (APP-08 and APP-11, in mobile/sched-app-logged-in once they're written) won't clear the
# app, so the login stays. Only those two keys are read: .env isn't run as a script.
env_value() { sed -n "s/^$1=//p" .env | tail -n 1 | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"; }
if [ "$app" = login ]; then
  SCHED_EMAIL=$(env_value SCHED_EMAIL) SCHED_PASSWORD=$(env_value SCHED_PASSWORD)
  if [ -z "$SCHED_EMAIL" ] || [ -z "$SCHED_PASSWORD" ]; then
    echo "mobile/login needs SCHED_EMAIL and SCHED_PASSWORD in .env (the QA account that logs in to the app)." >&2
    exit 1
  fi
  export MAESTRO_SCHED_EMAIL="$SCHED_EMAIL" MAESTRO_SCHED_PASSWORD="$SCHED_PASSWORD"
fi
# The app to open: Sched Dev on iOS (Diego's simulator build), the Sched app on Android. The platform comes from
# --platform (or --platform=), as Maestro reads it; without it, iOS.
platform=ios prev=
for arg in "$@"; do
  case "$arg" in --platform=*) platform="${arg#--platform=}" ;; esac
  [ "$prev" = --platform ] && platform="$arg"
  prev="$arg"
done
case "$app" in
  sched-app|login|sched-app-logged-in)
    if [ "$platform" = android ]; then default_app=com.sched; else default_app=com.sched.attendeeappbeta; fi
    export MAESTRO_APP_ID="${MAESTRO_APP_ID:-$default_app}" ;;
esac
mkdir -p mobile/results
maestro=$(command -v maestro || echo "$HOME/.maestro/maestro/bin/maestro")
if [ "$app" != login ]; then
  exec "$maestro" test --format junit --output "mobile/results/$app.xml" "$@" "mobile/$app"
fi
# Maestro keeps each run's logs and commands in ~/.maestro/tests, and for the login those can hold the typed password.
# After the login run, delete them and keep only the screenshots (the password field shows dots).
marker=$(mktemp)
status=0
"$maestro" test --format junit --output "mobile/results/$app.xml" "$@" "mobile/$app" || status=$?
find "$HOME/.maestro/tests" -mindepth 1 -maxdepth 1 -type d -newer "$marker" | while read -r run; do
  find "$run" -type f ! -name '*.png' -delete
done
rm -f "$marker"
exit $status
