#!/bin/sh
# Runs the Maestro flows in mobile/<app> (default sched-app) on the running emulator or simulator.
# Maestro passes shell variables that start with MAESTRO_ to the flows. Phase 1 needs no login, so no account is
# passed; a flow that needs one should get it that way (not as a command-line argument, which other processes can read).
set -e
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export MAESTRO_CLI_NO_ANALYTICS=1
app="${1:-sched-app}"
[ $# -gt 0 ] && shift
# The QA event on production the Sched app flows open (public, so the app's search finds it), and what they expect in it.
# Any of these can be set in the shell to point the flows somewhere else.
export MAESTRO_EVENT="${MAESTRO_EVENT:-qa reminders 2}" MAESTRO_ATTENDEE="${MAESTRO_ATTENDEE:-Silvina Suazo}"
export MAESTRO_SESSION="${MAESTRO_SESSION:-qa publico}"
# The app to open: Sched Dev on iOS (Diego's simulator build), the Sched app on Android.
case "$app:$*" in
  sched-app:*android*) export MAESTRO_APP_ID="${MAESTRO_APP_ID:-com.sched}"; set -- --exclude-tags ios-only "$@" ;;
  sched-app:*) export MAESTRO_APP_ID="${MAESTRO_APP_ID:-com.sched.attendeeappbeta}" ;;
esac
mkdir -p mobile/results
exec "$HOME/.maestro/maestro/bin/maestro" test --format junit --output "mobile/results/$app.xml" "$@" "mobile/$app"
