## Schedule Recurring Messages

Send messages every day, week or month - or even just a regular frequenc measured in seconds.

Pick the schedule via the blue button above. `Period` refers to a function that should fire every X seconds. DeTi checks its registry every 10 seconds, so one cannot run more frequently than that, nor on a schedule that is not a multiple of 10 seconds.

All messages to the functions are sent without arguments, and ignores the result. If the function requires arguments, it may fail. The schedule will attempt connection on the next designated time.

Note that the schedules are based on UTC. As local time changes (e.g. daylight savings) this may lead to a schedule running on a different time of day in your jurisdiction.

Also note that messages cost 0.1 DETI to send, and 0.0000001 DETI every 10 seconds to check between now and when your message goes out. So a message will cost 0.0008640 for each day between now and when it goes out. A message on a weekly cadence would cost about (.000864 \* 7 + 0.1 ~) 0.106 DETI. One sent every 30 seconds would cost (0.1 + 0.0000001 _ 3 _ 2880) = 288 DETI per day.

Test out your schedule via our public testing service at https://d7hzd-wiaaa-aaaap-qamba-cai.ic0.app/
