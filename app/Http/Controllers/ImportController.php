<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Inventory;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function importCustomers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        // Skip BOM if present
        $bom = fread($handle, 3);
        if ($bom !== chr(0xEF) . chr(0xBB) . chr(0xBF)) {
            rewind($handle);
        }

        $header = fgetcsv($handle, 0, ';');
        if (!$header) {
            $header = fgetcsv($handle, 0, ',');
            rewind($handle);
            fgetcsv($handle, 0, ','); // skip header again
            $delimiter = ',';
        } else {
            $delimiter = ';';
        }

        $imported = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            $row++;
            try {
                if (count($data) < 2) {
                    $errors[] = "Zeile {$row}: Zu wenige Spalten";
                    continue;
                }

                Customer::create([
                    'name' => $data[0] ?? '',
                    'company' => $data[1] ?? null,
                    'email' => $data[2] ?? null,
                    'phone' => $data[3] ?? null,
                    'address' => $data[4] ?? null,
                    'created_by' => auth()->id(),
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Zeile {$row}: " . $e->getMessage();
            }
        }

        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
            'total_errors' => count($errors),
        ]);
    }

    public function importInventory(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        $bom = fread($handle, 3);
        if ($bom !== chr(0xEF) . chr(0xBB) . chr(0xBF)) {
            rewind($handle);
        }

        $header = fgetcsv($handle, 0, ';');
        $delimiter = ';';
        if (!$header || count($header) <= 1) {
            rewind($handle);
            $header = fgetcsv($handle, 0, ',');
            $delimiter = ',';
        }

        $imported = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            $row++;
            try {
                if (count($data) < 2) {
                    $errors[] = "Zeile {$row}: Zu wenige Spalten";
                    continue;
                }

                Inventory::create([
                    'sku' => $data[0] ?? null,
                    'name' => $data[1] ?? '',
                    'description' => $data[2] ?? null,
                    'unit' => $data[3] ?? null,
                    'current_stock' => intval($data[4] ?? 0),
                    'min_stock' => intval($data[5] ?? 0),
                    'unit_price' => floatval($data[6] ?? 0),
                    'location' => $data[7] ?? null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Zeile {$row}: " . $e->getMessage();
            }
        }

        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
            'total_errors' => count($errors),
        ]);
    }
}
