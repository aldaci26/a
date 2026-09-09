; --------------------------------------------------
; Kitaplığım - Modern Windows Setup Kurulum Sihirbazı
; Nullsoft Scriptable Install System (NSIS)
; --------------------------------------------------

Unicode true
RequestExecutionLevel user ; Standart kullanıcı yetkisiyle kurulur, yönetici şifresi istemez!

Name "Kitaplığım"
OutFile "public/download/Kitaplik-Kurulum-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\Kitapligim"
InstallDirRegKey HKCU "Software\Kitapligim" "Install_Dir"

; Modern UI 2
!include "MUI2.nsh"
!include "FileFunc.nsh"

; Arayüz Ayarları
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install-blue.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall-blue.ico"

; Sayfalar
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\Kitaplik.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Kitaplığım Uygulamasını Şimdi Başlat"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Turkish"

Section "Kitapligim (Gerekli)" SecMain
    SectionIn RO

    SetOutPath "$INSTDIR"
    File "public/download/Kitaplik.exe"

    ; Masaüstü ve Başlat Menüsü Kısayolları
    CreateDirectory "$SMPROGRAMS\Kitaplığım"
    CreateShortcut "$SMPROGRAMS\Kitaplığım\Kitaplığım.lnk" "$INSTDIR\Kitaplik.exe"
    CreateShortcut "$SMPROGRAMS\Kitaplığım\Kaldır.lnk" "$INSTDIR\uninstall.exe"
    CreateShortcut "$DESKTOP\Kitaplığım.lnk" "$INSTDIR\Kitaplik.exe"

    ; Kaldırıcı oluşturma
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; Windows Denetim Masası / Program Ekle-Kaldır Kayıtları
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim" "DisplayName" "Kitaplığım — Kişisel Kütüphane"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim" "DisplayIcon" '"$INSTDIR\Kitaplik.exe"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim" "Publisher" "Kitapligim"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim" "DisplayVersion" "2.5.0"
SectionEnd

Section "Uninstall"
    Delete "$DESKTOP\Kitaplığım.lnk"
    Delete "$SMPROGRAMS\Kitaplığım\Kitaplığım.lnk"
    Delete "$SMPROGRAMS\Kitaplığım\Kaldır.lnk"
    RMDir "$SMPROGRAMS\Kitaplığım"

    Delete "$INSTDIR\Kitaplik.exe"
    Delete "$INSTDIR\kitaplik_veriler.txt"
    Delete "$INSTDIR\uninstall.exe"
    RMDir "$INSTDIR"

    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Kitapligim"
    DeleteRegKey HKCU "Software\Kitapligim"
SectionEnd
