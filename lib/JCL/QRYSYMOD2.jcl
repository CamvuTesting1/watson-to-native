//*******************************************************************
//*                                                                    
//* Copyright (c) 2017 IBM Corp.                                     
//* All rights reserved. This program and the accompanying materials 
//* are made available under the terms of the Eclipse Public License 
//* v1.0 which accompanies this distribution, and is available at   
//* http://www.eclipse.org/legal/epl-v10.html                       
//*                                                                 
//* Contributors:                                                   
//*  IBM Corp. - initial API and implementation                     
//*                                                                 
//*******************************************************************
//__QRYSYMOD__ JOB ,NOTIFY=&SYSUID,CLASS=A,MSGLEVEL=(1,1),MSGCLASS=__MSGCLASS__
//LISTMOD  EXEC SMPE                                                   
//SMPCSI   DD DISP=SHR,DSN=SMPE.&SYSR2..CSI                             
//SMPLOGA  DD DUMMY                                                    
//SMPLOG   DD SYSOUT=*                                                 
//SMPLIST  DD SYSOUT=*                                                 
//SMPCNTL  DD *                                                        
  SET BDY(GLOBAL) .                                                    
  LIST SYSMOD(__SYSMODNAME__).                                          
/*                                                                    
