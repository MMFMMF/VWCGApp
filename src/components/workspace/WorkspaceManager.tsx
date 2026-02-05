/**
 * Workspace Manager Component
 *
 * Provides UI for:
 * - WRK-01: Auto-save indicator
 * - WRK-02: Export workspace to .vwcg file
 * - WRK-03: Import workspace from .vwcg or .json
 * - WRK-04: Safe mode validation with partial import
 * - WRK-05: Version tracking and upgrade handling
 */

import { useState, useRef } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import {
  readWorkspaceFile,
  parseImport,
  getImportSections,
  WORKSPACE_VERSION,
  type ValidationResult,
} from '../../lib/workspace/fileHandler';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '../shared';

interface ImportState {
  file: File | null;
  data: unknown | null;
  validation: ValidationResult | null;
  sections: { id: string; name: string; hasData: boolean }[];
  selectedSections: string[];
  mergeMode: 'replace' | 'merge';
}

export default function WorkspaceManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>({
    file: null,
    data: null,
    validation: null,
    sections: [],
    selectedSections: [],
    mergeMode: 'replace',
  });
  const [showImportModal, setShowImportModal] = useState(false);

  const meta = useWorkspaceStore((state) => state.meta);
  const tools = useWorkspaceStore((state) => state.tools);
  const exportWorkspace = useWorkspaceStore((state) => state.exportWorkspace);
  const importWorkspace = useWorkspaceStore((state) => state.importWorkspace);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, validation } = await readWorkspaceFile(file);
      const sections = getImportSections(data);

      setImportState({
        file,
        data,
        validation,
        sections,
        selectedSections: sections.filter((s) => s.hasData).map((s) => s.id),
        mergeMode: 'replace',
      });
      setShowImportModal(true);
    } catch (err) {
      console.error('Failed to read file:', err);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm import
  const confirmImport = () => {
    if (!importState.data || !importState.validation?.valid) return;

    const workspace = parseImport(importState.data, {
      selectedSections: importState.selectedSections,
      mergeMode: importState.mergeMode,
    });

    if (workspace) {
      importWorkspace(workspace, importState.mergeMode === 'merge');
      setShowImportModal(false);
      setImportState({
        file: null,
        data: null,
        validation: null,
        sections: [],
        selectedSections: [],
        mergeMode: 'replace',
      });
    }
  };

  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setImportState((prev) => ({
      ...prev,
      selectedSections: prev.selectedSections.includes(sectionId)
        ? prev.selectedSections.filter((id) => id !== sectionId)
        : [...prev.selectedSections, sectionId],
    }));
  };

  const toolCount = Object.keys(tools).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Workspace Management</CardTitle>
        </CardHeader>

        <div className="space-y-4 p-6">
          {/* Current Workspace Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm space-y-1">
              <div>
                <strong>Workspace:</strong> {meta.name || 'Unnamed'}
              </div>
              <div>
                <strong>Version:</strong> {WORKSPACE_VERSION}
              </div>
              <div>
                <strong>Last Updated:</strong>{' '}
                {meta.updatedAt
                  ? new Date(meta.updatedAt).toLocaleString()
                  : 'Never'}
              </div>
              <div>
                <strong>Tools with Data:</strong> {toolCount}
              </div>
            </div>
          </div>

          {/* Auto-save indicator (WRK-01) */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-saving to browser storage
          </div>

          {/* Export Button (WRK-02) */}
          <Button
            variant="secondary"
            onClick={exportWorkspace}
            disabled={toolCount === 0}
            className="w-full"
          >
            Export Workspace (.vwcg)
          </Button>

          {/* Import Button (WRK-03) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".vwcg,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Import Workspace
          </Button>
        </div>
      </Card>

      {/* Import Modal (WRK-04 Safe Mode) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Import Workspace</h3>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm space-y-1">
                  <div>
                    <strong>File:</strong> {importState.file?.name}
                  </div>
                  {importState.validation?.fromVersion && (
                    <div className="flex items-center gap-2">
                      <strong>Version:</strong> {importState.validation.fromVersion}
                      {importState.validation.needsUpgrade && (
                        <Badge size="sm" variant="warning">
                          Will upgrade to {WORKSPACE_VERSION}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Errors */}
              {importState.validation && importState.validation.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="text-red-800 font-medium text-sm mb-1">
                    Errors:
                  </div>
                  <ul className="text-red-700 text-sm list-disc list-inside">
                    {importState.validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importState.validation && importState.validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="text-amber-800 font-medium text-sm mb-1">
                    Warnings:
                  </div>
                  <ul className="text-amber-700 text-sm list-disc list-inside">
                    {importState.validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section Selection (WRK-04) */}
              {importState.validation?.valid && importState.sections.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">
                    Select sections to import:
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {importState.sections.map((section) => (
                      <label
                        key={section.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={importState.selectedSections.includes(section.id)}
                          onChange={() => toggleSection(section.id)}
                          disabled={!section.hasData}
                          className="rounded"
                        />
                        <span className={!section.hasData ? 'text-gray-400' : ''}>
                          {section.name}
                        </span>
                        {!section.hasData && (
                          <span className="text-xs text-gray-400">(no data)</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Merge Mode */}
              {importState.validation?.valid && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Import mode:</div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={importState.mergeMode === 'replace'}
                        onChange={() =>
                          setImportState((p) => ({ ...p, mergeMode: 'replace' }))
                        }
                      />
                      <span className="text-sm">Replace current workspace</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={importState.mergeMode === 'merge'}
                        onChange={() =>
                          setImportState((p) => ({ ...p, mergeMode: 'merge' }))
                        }
                      />
                      <span className="text-sm">Merge with current</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmImport}
                  disabled={
                    !importState.validation?.valid ||
                    importState.selectedSections.length === 0
                  }
                  className="flex-1"
                >
                  Import {importState.selectedSections.length} section(s)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
