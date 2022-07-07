/* w2c/c-auto.h.  Generated from c-auto.in by configure.  */
/* c-auto.in.  Generated from configure.ac by autoheader.  */

/* w2c/c-auto.h: defines for web2c, as determined by configure.

   Copyright 1994-97, 2008-2012 Karl Berry.
   Copyright 1997-99, 2002, 2005 Olaf Weber.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.  */

/* Guard against double inclusion. */
#ifndef WEB2C_C_AUTO_H
#define WEB2C_C_AUTO_H

/* web2c: the version string. */
#define WEB2CVERSION " (Web2C 2012)"

/* Define if building universal (internal helper macro) */
/* #undef AC_APPLE_UNIVERSAL_BUILD */

/* web2c: Define if gcc asm needs _ on external symbols. */
/* #undef ASM_NEEDS_UNDERSCORE */

/* Define to 1 if the `closedir' function returns void instead of `int'. */
/* #undef CLOSEDIR_VOID */

/* web2c: Default editor for interactive `e' option. */
#define EDITOR "vi +%d '%s'"

/* metafont: Define to include EPSF pseudo window support. */
/* #undef EPSFWIN */

/* web2c: Define to enable HackyInputFileNameForCoreDump.tex. */
/* #undef FUNNY_CORE_DUMP */

/* Define to 1 if you have the `access' function. */
#define HAVE_ACCESS 1

/* Define to 1 if class `Annot' has the `decRefCnt' member. */
/* #undef HAVE_ANNOTDECREFCNT */

/* Define to 1 if you have the <assert.h> header file. */
#define HAVE_ASSERT_H 1

/* Define to 1 if you have the `atoi' function. */
#define HAVE_ATOI 1

/* Define to 1 if you have the `bcmp' function. */
#define HAVE_BCMP 1

/* Define to 1 if you have the `bcopy' function. */
#define HAVE_BCOPY 1

/* Define to 1 if you have the `bzero' function. */
#define HAVE_BZERO 1

/* Define to 1 if you have the Mac OS X Carbon framework. */
/* #undef HAVE_CARBON */

/* Define to 1 if you have the <dirent.h> header file, and it defines `DIR'.
   */
#define HAVE_DIRENT_H 1

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if you have the <errno.h> header file. */
#define HAVE_ERRNO_H 1

/* Define to 1 if you have the <float.h> header file. */
#define HAVE_FLOAT_H 1

/* Define to 1 if you have the `fmax' function. */
#define HAVE_FMAX 1

/* Define to 1 if fseeko (and presumably ftello) exists and is declared. */
#define HAVE_FSEEKO 1

/* Define to 1 if you have the `ftime' function. */
#define HAVE_FTIME 1

/* Define to 1 if you have the `getcwd' function. */
#define HAVE_GETCWD 1

/* Define to 1 if you have the `gettimeofday' function. */
#define HAVE_GETTIMEOFDAY 1

/* Define to 1 if you have the `getwd' function. */
#define HAVE_GETWD 1

/* Define to 1 if you have the `index' function. */
#define HAVE_INDEX 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Define to 1 if you have the <iostream> header file. */
/* #undef HAVE_IOSTREAM */

/* Define to 1 if you have the <langinfo.h> header file. */
#define HAVE_LANGINFO_H 1

/* Define if you have libfontconfig. */
/* #undef HAVE_LIBFONTCONFIG */

/* Define to 1 if you have the `posix' library (-lposix). */
/* #undef HAVE_LIBPOSIX */

/* Define to 1 if you have the <limits.h> header file. */
#define HAVE_LIMITS_H 1

/* Define to 1 if you have the <locale.h> header file. */
#define HAVE_LOCALE_H 1

/* Define to 1 if the system has the type `long double'. */
#define HAVE_LONG_DOUBLE 1

/* Define to 1 if the system has the type `long long int'. */
#define HAVE_LONG_LONG_INT 1

/* Define to 1 if you have the `memcmp' function. */
#define HAVE_MEMCMP 1

/* Define to 1 if you have the `memcpy' function. */
#define HAVE_MEMCPY 1

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to 1 if you have the `mkdtemp' function. */
#define HAVE_MKDTEMP 1

/* Define to 1 if you have the `mkstemp' function. */
#define HAVE_MKSTEMP 1

/* Define to 1 if you have the `mktemp' function. */
#define HAVE_MKTEMP 1

/* Define to 1 if you have the <ndir.h> header file, and it defines `DIR'. */
/* #undef HAVE_NDIR_H */

/* Define to 1 if you have the `putenv' function. */
#define HAVE_PUTENV 1

/* Define to 1 if you have the <pwd.h> header file. */
#define HAVE_PWD_H 1

/* Define to 1 if you have the `rindex' function. */
#define HAVE_RINDEX 1

/* Define to 1 if you have the `setlocale' function. */
#define HAVE_SETLOCALE 1

/* Define to 1 if you have the `snprintf' function. */
#define HAVE_SNPRINTF 1

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define to 1 if you have the `strcasecmp' function. */
#define HAVE_STRCASECMP 1

/* Define to 1 if you have the `strchr' function. */
#define HAVE_STRCHR 1

/* Define to 1 if you have the `strerror' function. */
#define HAVE_STRERROR 1

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define to 1 if you have the `strlcat' function. */
/* #undef HAVE_STRLCAT */

/* Define to 1 if you have the `strlcpy' function. */
/* #undef HAVE_STRLCPY */

/* Define to 1 if you have the `strrchr' function. */
#define HAVE_STRRCHR 1

/* Define to 1 if you have the `strstr' function. */
#define HAVE_STRSTR 1

/* Define to 1 if you have the `strtol' function. */
#define HAVE_STRTOL 1

/* Define to 1 if `st_mtim' is a member of `struct stat'. */
/* #undef HAVE_STRUCT_STAT_ST_MTIM */

/* Define to 1 if you have the <sys/dir.h> header file, and it defines `DIR'.
   */
/* #undef HAVE_SYS_DIR_H */

/* Define to 1 if you have the <sys/ndir.h> header file, and it defines `DIR'.
   */
/* #undef HAVE_SYS_NDIR_H */

/* Define to 1 if you have the <sys/param.h> header file. */
#define HAVE_SYS_PARAM_H 1

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/timeb.h> header file. */
#define HAVE_SYS_TIMEB_H 1

/* Define to 1 if you have the <sys/time.h> header file. */
#define HAVE_SYS_TIME_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Define to 1 if you have the <sys/wait.h> header file. */
#define HAVE_SYS_WAIT_H 1

/* Define to 1 if you have the <time.h> header file. */
#define HAVE_TIME_H 1

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* metafont: Define to include HP 2627 window support. */
/* #undef HP2627WIN */

/* tex: Define to enable --ipc. */
#define IPC 1

/* Define to the sub-directory in which libtool stores uninstalled libraries.
   */
#define LT_OBJDIR ".libs/"

/* metafont: Define to include mftalk (generic server) window support. */
/* #undef MFTALKWIN */

/* metafont: Define to include NeXT window support. */
/* #undef NEXTWIN */

/* web2c: Define to disable architecture-independent dump files. Faster on
   LittleEndian architectures. */
/* #undef NO_DUMP_SHARE */

/* Name of package */
#define WEB2C_PACKAGE "web2c"

/* Define to the address where bug reports for this package should be sent. */
#define WEB2C_PACKAGE_BUGREPORT "tex-k@tug.org"

/* Define to the full name of this package. */
#define WEB2C_PACKAGE_NAME "Web2C"

/* Define to the full name and version of this package. */
#define WEB2C_PACKAGE_STRING "Web2C 2012"

/* Define to the one symbol short name of this package. */
#define WEB2C_PACKAGE_TARNAME "web2c"

/* Define to the home page for this package. */
#define WEB2C_PACKAGE_URL ""

/* Define to the version of this package. */
#define WEB2C_PACKAGE_VERSION "2012"

/* metafont: Define to include Regis window support. */
/* #undef REGISWIN */

/* Define as the return type of signal handlers (`int' or `void'). */
#define RETSIGTYPE void

/* The size of `int', as computed by sizeof. */
#define SIZEOF_INT 4

/* The size of `long', as computed by sizeof. */
#define SIZEOF_LONG 4

/* The size of `off_t', as computed by sizeof. */
#define SIZEOF_OFF_T 0

/* Define to 1 if you have the ANSI C header files. */
#define STDC_HEADERS 1

/* metafont: Define to include old Suntools (not X) window support. */
/* #undef SUNWIN */

/* metafont: Define to include Tektronix window support. */
/* #undef TEKTRONIXWIN */

/* metafont: Define to include Uniterm window support. */
/* #undef UNITERMWIN */

/* Version number of package */
#define WEB2C_VERSION "2012"

/* Define WORDS_BIGENDIAN to 1 if your processor stores words with the most
   significant byte first (like Motorola and SPARC, unlike Intel). */
#if defined AC_APPLE_UNIVERSAL_BUILD
# if defined __BIG_ENDIAN__
#  define WORDS_BIGENDIAN 1
# endif
#else
# ifndef WORDS_BIGENDIAN
/* #  undef WORDS_BIGENDIAN */
# endif
#endif

/* Define to include X11 window in Metafont. */
/* #undef X11WIN */

/* Define to 1 if the X Window System is missing or not being used. */
#define X_DISPLAY_MISSING 1

/* Define to 1 if `lex' declares `yytext' as a `char *' by default, not a
   `char[]'. */
/* #undef YYTEXT_POINTER */

/* Enable large inode numbers on Mac OS X 10.5.  */
#ifndef _DARWIN_USE_64_BIT_INODE
# define _DARWIN_USE_64_BIT_INODE 1
#endif

/* Number of bits in a file offset, on hosts where this is settable. */
/* #undef _FILE_OFFSET_BITS */

/* Define to 1 to make fseeko visible on some hosts (e.g. glibc 2.2). */
/* #undef _LARGEFILE_SOURCE */

/* Define for large files, on AIX-style hosts. */
/* #undef _LARGE_FILES */

/* Define to 1 if type `char' is unsigned and you are not using gcc.  */
#ifndef __CHAR_UNSIGNED__
/* # undef __CHAR_UNSIGNED__ */
#endif

/* Define to empty if `const' does not conform to ANSI C. */
/* #undef const */

/* Define to `__inline__' or `__inline' if that's what the C compiler
   calls it, or to nothing if 'inline' is not supported under any name.  */
#ifndef __cplusplus
/* #undef inline */
#endif

/* Define to `unsigned int' if <sys/types.h> does not define. */
/* #undef size_t */

#endif /* !WEB2C_C_AUTO_H */
