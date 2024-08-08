
// This file is not intended to be edited, it is a C++ file that will be compiled into a dynamic library and used by the Tauri app.
// The function `print_document` is the one that will be called from the Tauri app to send data to a printer from the app.

#include <windows.h>
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// Función para obtener el nombre del dispositivo desde DEVNAMES
std::wstring GetDeviceName(HANDLE hDevNames) {
    if (!hDevNames) return L"";

    LPDEVNAMES pDevNames = (LPDEVNAMES)GlobalLock(hDevNames);
    if (!pDevNames) return L"";

    wchar_t* deviceName = (wchar_t*)pDevNames + pDevNames->wDeviceOffset;
    std::wstring deviceNameStr(deviceName);

    wchar_t* driverName = (wchar_t*)pDevNames + pDevNames->wDriverOffset;
    std::wstring driverNameStr(driverName);

    wchar_t* portName = (wchar_t*)pDevNames + pDevNames->wOutputOffset;
    std::wstring portNameStr(portName);

    GlobalUnlock(hDevNames);

    return L"Device: " + deviceNameStr + L"\nDriver: " + driverNameStr + L"\nPort: " + portNameStr;
}

void ShowPrintDlgResult(const PRINTDLGW& pd) {
    std::wcout << L"PrintDlgW result:" << std::endl;
    std::wcout << L"  hDC: " << pd.hDC << std::endl;
    std::wcout << L"  hDevMode: " << pd.hDevMode << std::endl;
    std::wcout << L"  hDevNames: " << pd.hDevNames << std::endl;
    std::wcout << L"  Flags: " << pd.Flags << std::endl;

    std::wstring deviceName = GetDeviceName(pd.hDevNames);
    std::wcout << L"  Device Information:\n" << deviceName << std::endl;
}

std::vector<std::wstring> SplitTextIntoLines(const std::wstring& text, int maxWidth, HDC hdc) {
    std::vector<std::wstring> lines;
    std::wistringstream stream(text);
    std::wstring line;
    SIZE textSize;
    
    while (std::getline(stream, line, L'\n')) {
        std::wstring currentLine;
        for (const wchar_t& ch : line) {
            currentLine += ch;
            GetTextExtentPoint32W(hdc, currentLine.c_str(), currentLine.length(), &textSize);
            if (textSize.cx > maxWidth) {
                currentLine.pop_back();
                lines.push_back(currentLine);
                currentLine = ch;
            }
        }
        if (!currentLine.empty()) {
            lines.push_back(currentLine);
        }
    }
    
    return lines;
}

extern "C" __declspec(dllexport) void print_document(const wchar_t* text) {
    PRINTDLGW pd;
    memset(&pd, 0, sizeof(pd));
    pd.lStructSize = sizeof(pd);
    pd.Flags = PD_RETURNDC | PD_USEDEVMODECOPIES | PD_PRINTSETUP;

    if (PrintDlgW(&pd)) {
        std::wcout << L"PrintDlgW succeeded." << std::endl;

        ShowPrintDlgResult(pd);

        HDC hdc = pd.hDC;
        if (hdc) {
            DOCINFOW di;
            memset(&di, 0, sizeof(di));
            di.cbSize = sizeof(di);
            di.lpszDocName = L"Test Document";
            di.lpszOutput = NULL;
            di.lpszDatatype = NULL;
            di.fwType = 0;

            if (StartDocW(hdc, &di) > 0) {
                if (StartPage(hdc) > 0) {
                    HFONT hFont = CreateFontW(
                        48,
                        0,
                        0,
                        0,
                        FW_NORMAL,
                        FALSE,
                        FALSE,
                        FALSE,
                        DEFAULT_CHARSET,
                        OUT_DEFAULT_PRECIS,
                        CLIP_DEFAULT_PRECIS,
                        DEFAULT_QUALITY,
                        DEFAULT_PITCH,
                        L"Arial"
                    );
                    HFONT hOldFont = (HFONT)SelectObject(hdc, hFont);

                    // Calcular el ancho máximo para la impresión
                    SIZE textSize;
                    GetTextExtentPoint32W(hdc, L"AAAAAAAAAA", 10, &textSize);
                    int maxWidth = textSize.cx * 5; // Ajustar según sea necesario

                    auto lines = SplitTextIntoLines(text, maxWidth, hdc);

                    int yOffset = 100;
                    for (const auto& line : lines) {
                        TextOutW(hdc, 100, yOffset, line.c_str(), line.length());
                        yOffset += 60; // Ajustar según el tamaño de la fuente
                    }

                    SelectObject(hdc, hOldFont);
                    DeleteObject(hFont);

                    EndPage(hdc);
                } else {
                    std::wcerr << L"Failed to start page. Error code: " << GetLastError() << std::endl;
                }

                EndDoc(hdc);
            } else {
                std::wcerr << L"Failed to start document. Error code: " << GetLastError() << std::endl;
            }

            DeleteDC(hdc);
        } else {
            std::cerr << "Failed to get printing device context." << std::endl;
        }
    } else {
        std::cerr << "Failed to open print dialog. Error code: " << CommDlgExtendedError() << std::endl;
    }
}
