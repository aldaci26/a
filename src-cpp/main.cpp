#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <commctrl.h>
#include <shellapi.h>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <algorithm>

#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "shell32.lib")

struct BookItem {
    std::wstring title;
    std::wstring author;
    std::wstring category;
    int totalPages;
    int currentPage;
    int rating;
    std::wstring notes;
    std::wstring quote;
};

// Global application state
std::vector<BookItem> g_books;
int g_selectedIndex = 0;

// Colors
const COLORREF BG_COLOR = RGB(15, 15, 20);
const COLORREF CARD_BG = RGB(25, 25, 32);
const COLORREF TEXT_PRIMARY = RGB(245, 245, 247);
const COLORREF TEXT_MUTED = RGB(160, 160, 175);
const COLORREF ACCENT_GOLD = RGB(245, 175, 25);
const COLORREF ACCENT_GREEN = RGB(34, 197, 94);
const COLORREF BORDER_COLOR = RGB(45, 45, 58);

HBRUSH g_hbrBg = NULL;
HBRUSH g_hbrCard = NULL;
HFONT g_hFontTitle = NULL;
HFONT g_hFontSub = NULL;
HFONT g_hFontBody = NULL;
HFONT g_hFontBold = NULL;
HFONT g_hFontQuote = NULL;

HWND g_hMainWnd = NULL;
HWND g_hBtnPlus10 = NULL;
HWND g_hBtnMinus10 = NULL;
HWND g_hBtnFinish = NULL;
HWND g_hBtnOpenWeb = NULL;
HWND g_hBtnAddBook = NULL;
HWND g_hBtnReset = NULL;

// File Persistence
void SaveData() {
    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    std::wstring path(exePath);
    size_t pos = path.find_last_of(L"\\/");
    if (pos != std::wstring::npos) {
        path = path.substr(0, pos + 1) + L"kitaplik_veriler.txt";
    } else {
        path = L"kitaplik_veriler.txt";
    }

    std::wofstream outFile(path.c_str());
    if (outFile.is_open()) {
        for (size_t i = 0; i < g_books.size(); ++i) {
            outFile << g_books[i].title << L"|"
                    << g_books[i].author << L"|"
                    << g_books[i].category << L"|"
                    << g_books[i].totalPages << L"|"
                    << g_books[i].currentPage << L"|"
                    << g_books[i].rating << L"|"
                    << g_books[i].notes << L"|"
                    << g_books[i].quote << L"\n";
        }
        outFile.close();
    }
}

void LoadData() {
    g_books.clear();

    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    std::wstring path(exePath);
    size_t pos = path.find_last_of(L"\\/");
    if (pos != std::wstring::npos) {
        path = path.substr(0, pos + 1) + L"kitaplik_veriler.txt";
    } else {
        path = L"kitaplik_veriler.txt";
    }

    std::wifstream inFile(path.c_str());
    if (inFile.is_open()) {
        std::wstring line;
        while (std::getline(inFile, line)) {
            if (line.empty()) continue;
            std::wstringstream ss(line);
            std::wstring item;
            std::vector<std::wstring> tokens;
            while (std::getline(ss, item, L'|')) {
                tokens.push_back(item);
            }
            if (tokens.size() >= 8) {
                BookItem b;
                b.title = tokens[0];
                b.author = tokens[1];
                b.category = tokens[2];
                b.totalPages = _wtoi(tokens[3].c_str());
                b.currentPage = _wtoi(tokens[4].c_str());
                b.rating = _wtoi(tokens[5].c_str());
                b.notes = tokens[6];
                b.quote = tokens[7];
                g_books.push_back(b);
            }
        }
        inFile.close();
    }

    // Default books: Yırtıcı Kuş and İş Bankası classics
    if (g_books.empty()) {
        BookItem b1;
        b1.title = L"Yırtıcı Kuş";
        b1.author = L"Wilbur Smith";
        b1.category = L"Macera & Tarih";
        b1.totalPages = 608;
        b1.currentPage = 240;
        b1.rating = 5;
        b1.notes = L"Sir Francis Courteney ve oğlu Hal'in fırtınalı Hint Okyanusu serüveni.";
        b1.quote = L"\"Deniz asla affetmez oğlum; ama cesur olanlara hazinelerini açar.\"";
        g_books.push_back(b1);

        BookItem b2;
        b2.title = L"Satranç";
        b2.author = L"Stefan Zweig";
        b2.category = L"Klasik Edebiyat";
        b2.totalPages = 84;
        b2.currentPage = 84;
        b2.rating = 5;
        b2.notes = L"Türkiye İş Bankası Kültür Yayınları. Dr. B'nin tecrit psikolojisi ve satranç düellosu.";
        b2.quote = L"\"İnsan dünyada tek başına hiçbir şey yapamaz; ruhu besleyecek bir yankı arar.\"";
        g_books.push_back(b2);

        BookItem b3;
        b3.title = L"Dönüşüm";
        b3.author = L"Franz Kafka";
        b3.category = L"Klasik Edebiyat";
        b3.totalPages = 104;
        b3.currentPage = 104;
        b3.rating = 5;
        b3.notes = L"Türkiye İş Bankası Kültür Yayınları. Gregor Samsa'nın yabancılaşması.";
        b3.quote = L"\"Bir kitap, içimizdeki donmuş denizi parçalayacak bir balta olmalıdır.\"";
        g_books.push_back(b3);

        BookItem b4;
        b4.title = L"Yeraltından Notlar";
        b4.author = L"Fyodor Dostoyevski";
        b4.category = L"Felsefe & Düşünce";
        b4.totalPages = 140;
        b4.currentPage = 60;
        b4.rating = 5;
        b4.notes = L"Türkiye İş Bankası Kültür Yayınları. Varoluşçu edebiyatın köşe taşı.";
        b4.quote = L"\"Aşırı bilinç bir hastalıktır, gerçek ve tam bir hastalık.\"";
        g_books.push_back(b4);

        BookItem b5;
        b5.title = L"1984";
        b5.author = L"George Orwell";
        b5.category = L"Bilim Kurgu";
        b5.totalPages = 352;
        b5.currentPage = 120;
        b5.rating = 5;
        b5.notes = L"Türkiye İş Bankası Kültür Yayınları. Düşünce özgürlüğü ve distopya.";
        b5.quote = L"\"Geçmişi denetleyen geleceği de denetler; şimdiyi denetleyen geçmişi de denetler.\"";
        g_books.push_back(b5);

        SaveData();
    }
}

void DrawCustomUI(HWND hWnd, HDC hdc) {
    RECT clientRect;
    GetClientRect(hWnd, &clientRect);

    // Double buffering
    HDC memDC = CreateCompatibleDC(hdc);
    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, clientRect.right, clientRect.bottom);
    HBITMAP oldBitmap = (HBITMAP)SelectObject(memDC, memBitmap);

    // Background fill
    FillRect(memDC, &clientRect, g_hbrBg);

    SetBkMode(memDC, TRANSPARENT);

    // Header Bar (Clean typography, no weird texts)
    RECT headerRect = { 30, 20, clientRect.right - 30, 70 };
    SelectObject(memDC, g_hFontTitle);
    SetTextColor(memDC, ACCENT_GOLD);
    DrawTextW(memDC, L"KİTAPLIĞIM", -1, &headerRect, DT_LEFT | DT_SINGLELINE);

    RECT subRect = { 30, 52, clientRect.right - 30, 80 };
    SelectObject(memDC, g_hFontSub);
    SetTextColor(memDC, TEXT_MUTED);
    DrawTextW(memDC, L"Kişisel Kütüphane & Okuma Takip Sistemi", -1, &subRect, DT_LEFT | DT_SINGLELINE);

    // Decorative Header Divider
    HPEN hPenBorder = CreatePen(PS_SOLID, 1, BORDER_COLOR);
    HPEN oldPen = (HPEN)SelectObject(memDC, hPenBorder);
    MoveToEx(memDC, 30, 85, NULL);
    LineTo(memDC, clientRect.right - 30, 85);

    if (g_selectedIndex >= 0 && g_selectedIndex < (int)g_books.size()) {
        BookItem& current = g_books[g_selectedIndex];

        // Card Container
        RECT cardRect = { 30, 105, clientRect.right - 30, 430 };
        FillRect(memDC, &cardRect, g_hbrCard);

        // Card border
        HPEN hPenGold = CreatePen(PS_SOLID, 1, RGB(70, 60, 45));
        SelectObject(memDC, hPenGold);
        Rectangle(memDC, cardRect.left, cardRect.top, cardRect.right, cardRect.bottom);
        DeleteObject(hPenGold);

        // Book 3D Cover Simulation (Left Box)
        RECT coverRect = { 55, 130, 210, 400 };
        HBRUSH hbrCover = CreateSolidBrush(RGB(38, 28, 20));
        FillRect(memDC, &coverRect, hbrCover);
        DeleteObject(hbrCover);

        // Cover Spine line
        HPEN hPenSpine = CreatePen(PS_SOLID, 4, RGB(180, 120, 20));
        SelectObject(memDC, hPenSpine);
        MoveToEx(memDC, 60, 130, NULL);
        LineTo(memDC, 60, 400);
        DeleteObject(hPenSpine);

        // Cover Text
        SelectObject(memDC, g_hFontBold);
        SetTextColor(memDC, ACCENT_GOLD);
        RECT coverTitleRect = { 75, 180, 200, 250 };
        DrawTextW(memDC, current.title.c_str(), -1, &coverTitleRect, DT_CENTER | DT_WORDBREAK);

        SelectObject(memDC, g_hFontSub);
        SetTextColor(memDC, RGB(220, 200, 170));
        RECT coverAuthorRect = { 75, 260, 200, 300 };
        DrawTextW(memDC, current.author.c_str(), -1, &coverAuthorRect, DT_CENTER | DT_WORDBREAK);

        // Details on right side of card
        SelectObject(memDC, g_hFontTitle);
        SetTextColor(memDC, TEXT_PRIMARY);
        RECT titleRect = { 235, 130, clientRect.right - 55, 165 };
        DrawTextW(memDC, current.title.c_str(), -1, &titleRect, DT_LEFT | DT_SINGLELINE);

        SelectObject(memDC, g_hFontSub);
        SetTextColor(memDC, ACCENT_GOLD);
        std::wstring authorLine = L"Yazar: " + current.author + L"  |  Kategori: " + current.category;
        RECT authorRect = { 235, 170, clientRect.right - 55, 195 };
        DrawTextW(memDC, authorLine.c_str(), -1, &authorRect, DT_LEFT | DT_SINGLELINE);

        // Reading Progress
        int percent = (current.totalPages > 0) ? (current.currentPage * 100 / current.totalPages) : 0;
        std::wstring progText = L"Okuma İlerlemesi: " + std::to_wstring(current.currentPage) + L" / " + std::to_wstring(current.totalPages) + L" Sayfa (%" + std::to_wstring(percent) + L")";

        SelectObject(memDC, g_hFontBold);
        SetTextColor(memDC, TEXT_PRIMARY);
        RECT progRect = { 235, 210, clientRect.right - 55, 235 };
        DrawTextW(memDC, progText.c_str(), -1, &progRect, DT_LEFT | DT_SINGLELINE);

        // Progress Bar Background
        int barLeft = 235;
        int barTop = 240;
        int barWidth = clientRect.right - 55 - barLeft;
        int barHeight = 18;

        RECT barBg = { barLeft, barTop, barLeft + barWidth, barTop + barHeight };
        HBRUSH hbrBarBg = CreateSolidBrush(RGB(18, 18, 24));
        FillRect(memDC, &barBg, hbrBarBg);
        DeleteObject(hbrBarBg);

        // Progress Bar Fill
        int fillWidth = (barWidth * percent) / 100;
        if (fillWidth > 0) {
            RECT barFill = { barLeft, barTop, barLeft + fillWidth, barTop + barHeight };
            HBRUSH hbrFill = CreateSolidBrush(ACCENT_GOLD);
            FillRect(memDC, &barFill, hbrFill);
            DeleteObject(hbrFill);
        }

        // Quote Box inside card
        RECT quoteBox = { 235, 275, clientRect.right - 55, 360 };
        HBRUSH hbrQuoteBg = CreateSolidBrush(RGB(20, 20, 26));
        FillRect(memDC, &quoteBox, hbrQuoteBg);
        DeleteObject(hbrQuoteBg);

        SelectObject(memDC, g_hFontQuote);
        SetTextColor(memDC, RGB(220, 215, 200));
        RECT quoteTextRect = { 250, 285, clientRect.right - 70, 350 };
        DrawTextW(memDC, current.quote.c_str(), -1, &quoteTextRect, DT_LEFT | DT_WORDBREAK);

        // Personal Note
        SelectObject(memDC, g_hFontBody);
        SetTextColor(memDC, TEXT_MUTED);
        std::wstring noteLine = L"Not: " + current.notes;
        RECT noteRect = { 235, 375, clientRect.right - 55, 415 };
        DrawTextW(memDC, noteLine.c_str(), -1, &noteRect, DT_LEFT | DT_WORDBREAK);
    }

    // Bottom Status Bar
    RECT statusRect = { 30, clientRect.bottom - 40, clientRect.right - 30, clientRect.bottom - 10 };
    SelectObject(memDC, g_hFontBody);
    SetTextColor(memDC, RGB(120, 120, 135));
    std::wstring statusLine = L"Toplam Kayıtlı Eser: " + std::to_wstring(g_books.size()) + L"  |  Veriler kitaplik_veriler.txt dosyasına anlık kaydedilir.";
    DrawTextW(memDC, statusLine.c_str(), -1, &statusRect, DT_LEFT | DT_SINGLELINE);

    SelectObject(memDC, oldPen);
    DeleteObject(hPenBorder);

    // Blit to screen
    BitBlt(hdc, 0, 0, clientRect.right, clientRect.bottom, memDC, 0, 0, SRCCOPY);

    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
}

// Dialog to Add a New Book
INT_PTR CALLBACK AddBookDlgProc(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_INITDIALOG:
        SetDlgItemTextW(hDlg, 101, L"");
        SetDlgItemTextW(hDlg, 102, L"");
        SetDlgItemTextW(hDlg, 103, L"Macera & Tarih");
        SetDlgItemTextW(hDlg, 104, L"350");
        SetDlgItemTextW(hDlg, 105, L"0");
        return TRUE;
    case WM_COMMAND:
        if (LOWORD(wParam) == IDOK) {
            wchar_t szTitle[256] = { 0 };
            wchar_t szAuthor[256] = { 0 };
            wchar_t szCategory[256] = { 0 };
            wchar_t szPages[64] = { 0 };
            wchar_t szCurrent[64] = { 0 };

            GetDlgItemTextW(hDlg, 101, szTitle, 256);
            GetDlgItemTextW(hDlg, 102, szAuthor, 256);
            GetDlgItemTextW(hDlg, 103, szCategory, 256);
            GetDlgItemTextW(hDlg, 104, szPages, 64);
            GetDlgItemTextW(hDlg, 105, szCurrent, 64);

            if (wcslen(szTitle) > 0 && wcslen(szAuthor) > 0) {
                BookItem b;
                b.title = szTitle;
                b.author = szAuthor;
                b.category = szCategory;
                b.totalPages = _wtoi(szPages);
                if (b.totalPages <= 0) b.totalPages = 300;
                b.currentPage = _wtoi(szCurrent);
                b.rating = 5;
                b.notes = L"Kütüphaneye yeni eklendi.";
                b.quote = L"\"Kitaplar, insan ruhunun aynasıdır.\"";
                g_books.push_back(b);
                g_selectedIndex = (int)g_books.size() - 1;
                SaveData();
            }
            EndDialog(hDlg, IDOK);
            return TRUE;
        } else if (LOWORD(wParam) == IDCANCEL) {
            EndDialog(hDlg, IDCANCEL);
            return TRUE;
        }
        break;
    }
    return FALSE;
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_CREATE: {
        g_hbrBg = CreateSolidBrush(BG_COLOR);
        g_hbrCard = CreateSolidBrush(CARD_BG);

        g_hFontTitle = CreateFontW(26, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, L"Segoe UI");
        g_hFontSub = CreateFontW(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, L"Segoe UI");
        g_hFontBody = CreateFontW(14, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, L"Segoe UI");
        g_hFontBold = CreateFontW(16, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, L"Segoe UI");
        g_hFontQuote = CreateFontW(16, 0, 0, 0, FW_NORMAL, TRUE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, L"Georgia");

        // Action Buttons below card
        g_hBtnMinus10 = CreateWindowW(L"BUTTON", L"-10 Sayfa", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            30, 450, 100, 36, hWnd, (HMENU)1001, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        g_hBtnPlus10 = CreateWindowW(L"BUTTON", L"+10 Sayfa", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            140, 450, 100, 36, hWnd, (HMENU)1002, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        g_hBtnFinish = CreateWindowW(L"BUTTON", L"Bitir (100%)", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            250, 450, 110, 36, hWnd, (HMENU)1003, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        g_hBtnAddBook = CreateWindowW(L"BUTTON", L"Yeni Kitap Ekle...", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            370, 450, 140, 36, hWnd, (HMENU)1004, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        g_hBtnReset = CreateWindowW(L"BUTTON", L"Yalnızca Yırtıcı Kuş", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            520, 450, 160, 36, hWnd, (HMENU)1005, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        g_hBtnOpenWeb = CreateWindowW(L"BUTTON", L"Web Sürümünü Aç", WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
            690, 450, 140, 36, hWnd, (HMENU)1006, ((LPCREATESTRUCT)lParam)->hInstance, NULL);

        break;
    }
    case WM_COMMAND: {
        int wmId = LOWORD(wParam);
        if (g_selectedIndex >= 0 && g_selectedIndex < (int)g_books.size()) {
            BookItem& b = g_books[g_selectedIndex];
            if (wmId == 1001) { // -10 Sayfa
                b.currentPage = (std::max)(0, b.currentPage - 10);
                SaveData();
                InvalidateRect(hWnd, NULL, FALSE);
            } else if (wmId == 1002) { // +10 Sayfa
                b.currentPage = (std::min)(b.totalPages, b.currentPage + 10);
                SaveData();
                InvalidateRect(hWnd, NULL, FALSE);
            } else if (wmId == 1003) { // Bitir
                b.currentPage = b.totalPages;
                SaveData();
                InvalidateRect(hWnd, NULL, FALSE);
            }
        }

        if (wmId == 1004) { // Yeni Kitap Ekle
            // Quick input prompt
            BookItem newB;
            newB.title = L"Yeni Eser";
            newB.author = L"Yazar";
            newB.category = L"Roman";
            newB.totalPages = 350;
            newB.currentPage = 0;
            newB.rating = 5;
            newB.notes = L"Koleksiyona eklendi.";
            newB.quote = L"\"Okumak, ozgurluge ucmaktir.\"";
            g_books.push_back(newB);
            g_selectedIndex = (int)g_books.size() - 1;
            SaveData();
            InvalidateRect(hWnd, NULL, FALSE);
            MessageBoxW(hWnd, L"Yeni kitap eklendi ve secildi!", L"Bilgi", MB_OK | MB_ICONINFORMATION);
        } else if (wmId == 1005) { // Reset to only Yırtıcı Kuş
            if (MessageBoxW(hWnd, L"Tum kitaplar silinip yalnizca \"Yırtıcı Kuş\" kalsin mi?", L"Onay", MB_YESNO | MB_ICONQUESTION) == IDYES) {
                g_books.clear();
                BookItem b;
                b.title = L"Yırtıcı Kuş";
                b.author = L"Wilbur Smith";
                b.category = L"Macera & Tarih";
                b.totalPages = 608;
                b.currentPage = 240;
                b.rating = 5;
                b.notes = L"Sir Francis Courteney ve oglu Hal'in firtinali Hint Okyanusu seruveni.";
                b.quote = L"\"Deniz asla affetmez oglum; ama cesur olanlara hazinelerini acar.\"";
                g_books.push_back(b);
                g_selectedIndex = 0;
                SaveData();
                InvalidateRect(hWnd, NULL, FALSE);
            }
        } else if (wmId == 1006) { // Web surumunu ac
            ShellExecuteW(NULL, L"open", L"https://ais-dev-otwtau677gou4ba6srynlr-818432400034.europe-west2.run.app", NULL, NULL, SW_SHOWNORMAL);
        }
        break;
    }
    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hWnd, &ps);
        DrawCustomUI(hWnd, hdc);
        EndPaint(hWnd, &ps);
        break;
    }
    case WM_ERASEBKGND:
        return 1; // Prevent flicker
    case WM_DESTROY:
        if (g_hbrBg) DeleteObject(g_hbrBg);
        if (g_hbrCard) DeleteObject(g_hbrCard);
        if (g_hFontTitle) DeleteObject(g_hFontTitle);
        if (g_hFontSub) DeleteObject(g_hFontSub);
        if (g_hFontBody) DeleteObject(g_hFontBody);
        if (g_hFontBold) DeleteObject(g_hFontBold);
        if (g_hFontQuote) DeleteObject(g_hFontQuote);
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProcW(hWnd, message, wParam, lParam);
    }
    return 0;
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR lpCmdLine, int nCmdShow);

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    return wWinMain(hInstance, hPrevInstance, NULL, nCmdShow);
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR lpCmdLine, int nCmdShow) {
    INITCOMMONCONTROLSEX icex;
    icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icex.dwICC = ICC_STANDARD_CLASSES | ICC_PROGRESS_CLASS;
    InitCommonControlsEx(&icex);

    LoadData();

    WNDCLASSEXW wcex = { 0 };
    wcex.cbSize = sizeof(WNDCLASSEXW);
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.hInstance = hInstance;
    wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszClassName = L"KitaplikObsidianWinClass";

    RegisterClassExW(&wcex);

    HWND hWnd = CreateWindowW(
        L"KitaplikObsidianWinClass",
        L"Kitaplığım — Kişisel Kütüphane & Okuma Takip Sistemi",
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 890, 560,
        NULL, NULL, hInstance, NULL
    );

    if (!hWnd) return FALSE;

    g_hMainWnd = hWnd;
    ShowWindow(hWnd, nCmdShow);
    UpdateWindow(hWnd);

    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    return (int)msg.wParam;
}
