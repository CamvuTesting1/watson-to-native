//__INSTASYMOD__ JOB D55,CLASS=A,REGION=128M,
//         NOTIFY=&SYSUID,MSGCLASS=H,COND=(4,LT)
/*JOBPARM  S=*
//*
//EXPORT1  EXPORT SYMLIST=(IPLVOL,MAINT,REJECT)
//* Set the target IPL volume to the active or alternate IPL volume
//SETIPL   SET IPLVOL=&SYSR1.      Active IPL volume
//*ETIPL   SET IPLVOL=&SYSR2.      Change to alternate IPL volume
//*
//* Set maintenance to the APAR/PTF to be installed
//SETMAINT SET MAINT=__SYSMODNAME__       Set to the APAR/PTF to install
//*
//* Set REJECT symbol to determine if the maintenance is rejected from
//* the SMPE Global zone.  One would reject a APAR/PTF is a new version
//* is provided without a REWORK date or the REWORK date is unchanged.
//SETREJCT SET REJECT=NO           Set REJECT to YES or NO
//*
//*--------------------------------------------------------------------
//* __INSTACOMMENT__- Installed by Watson Assistant bot
//*--------------------------------------------------------------------
//*
//*--------------------------------------------------------------------
//* Test the REJECT symbol setting using SuperC
//*--------------------------------------------------------------------
//*
//*
//CHKREJCT EXEC PGM=ISRSUPC,
//            PARM=(SRCHCMP,'ANYC,FINDALL,NOPRTCC,LONGLN,XREF')
//NEWDD    DD *,SYMBOLS=EXECSYS
  &REJECT
//OUTDD    DD SYSOUT=*
//SYSIN    DD *
  SRCHFOR  'YES'
/*
//*
//IFREJECT IF (CHKREJCT.RC EQ 1) THEN
//*--------------------------------------------------------------------
//* Reject then receive
//*--------------------------------------------------------------------
//REJECT   EXEC SMPE
//SMPCSI   DD DISP=SHR,DSN=SMPE.&IPLVOL..CSI
//SMPLOG   DD SYSOUT=*
//SMPLOGA  DD DUMMY
//SMPCNTL  DD *,SYMBOLS=EXECSYS
   SET BDY(GLOBAL) .
   REJECT
   S(&MAINT
     )
   BYPASS(APPLYCHECK,ACCEPTCHECK).
   RESETRC.
/*
//*
//IFREJECT ENDIF
//*--------------------------------------------------------------------
//* SMPE Receive the maintenance
//*--------------------------------------------------------------------
//RECEIVE  EXEC SMPE
//SMPCSI   DD DISP=SHR,DSN=SMPE.&IPLVOL..CSI
//SMPLOG   DD SYSOUT=*
//SMPLOGA  DD DUMMY
//SMPPTFIN DD DISP=SHR,DSN=D55TST.ZOSR22.LKED.K22(&MAINT.)
//SMPCNTL  DD *
  SET BDY(GLOBAL) .
  RECEIVE SYSMODS LIST.
/*
//*
//*--------------------------------------------------------------------
//* Apply check the maintenance if the receive was okay
//*--------------------------------------------------------------------
//IFRCVOK IF RECEIVE.SMPE.RC LT 5 THEN
//APPLYC   EXEC SMPE
//SMPCSI   DD DISP=SHR,DSN=SMPE.&IPLVOL..CSI
//SMPLOG   DD SYSOUT=*
//SMPLOGA  DD DUMMY
//AMODGEN  DD DISP=SHR,UNIT=3390,DSN=SYS1.MODGEN,VOL=SER=&IPLVOL.
//SYSLIB   DD DISP=SHR,DSN=SYS1.&IPLVOL..SMPMTS,
//            UNIT=3390,VOL=SER=&IPLVOL.
//         DD DISP=SHR,UNIT=3390,DSN=SYS1.MODGEN,VOL=SER=&IPLVOL.
//         DD DISP=SHR,UNIT=3390,DSN=SYS1.MACLIB,VOL=SER=&IPLVOL.
//SMPCNTL  DD *,SYMBOLS=EXECSYS
  SET BDY(&IPLVOL.T).
  APPLY SELECT(
              &MAINT
              )
  BYPASS(HOLDSYS) GROUP CHECK REDO.
/*
//*
//*--------------------------------------------------------------------
//*  Apply the maintenance if the apply check was okay
//*--------------------------------------------------------------------
//IFAPCOK IF APPLYC.SMPE.RC LT 5 THEN
//APPLY    EXEC SMPE,REGION=128M
//SMPLOG   DD SYSOUT=*
//SMPLOGA  DD DUMMY
//SMPCSI   DD DISP=SHR,DSN=SMPE.&IPLVOL..CSI
//AMODGEN  DD DISP=SHR,UNIT=3390,DSN=SYS1.MODGEN,VOL=SER=&IPLVOL.
//SYSLIB   DD DISP=SHR,DSN=SYS1.&IPLVOL..SMPMTS,
//            UNIT=3390,VOL=SER=&IPLVOL.
//         DD DISP=SHR,UNIT=3390,DSN=SYS1.MODGEN,VOL=SER=&IPLVOL.
//         DD DISP=SHR,UNIT=3390,DSN=SYS1.MACLIB,VOL=SER=&IPLVOL.
//         DD DISP=SHR,UNIT=3390,DSN=SYS1.SHASMAC,VOL=SER=&IPLVOL.
//SMPCNTL  DD *,SYMBOLS=EXECSYS
  SET BDY(&IPLVOL.T).
  APPLY SELECT(
               &MAINT
               )
  BYPASS(HOLDSYS) GROUP REDO.

  LIST SYSMOD(&MAINT.).
/*
// ENDIF (APPLYC)
// ENDIF (RECEIVE)
//*
//
