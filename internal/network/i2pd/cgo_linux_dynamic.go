//go:build cgo_i2pd && linux && dynamic_libs

package i2pd

/*
#cgo linux LDFLAGS: -L${SRCDIR} -Wl,--whole-archive -li2pdclient -li2pd -li2pdlang -Wl,--no-whole-archive -lminiupnpc -lssl -lcrypto -lz -lboost_filesystem -lboost_program_options -lboost_date_time -lpthread -lstdc++ -lm -ldl
*/
import "C"
