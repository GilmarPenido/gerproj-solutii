// (arquivo completo /c:/Users/Solutii/OneDrive/Documentos/Projetos/gerproj-solutii/components/user.tsx)
import React, { useEffect, useState, useCallback} from "react";
import { useSession } from "next-auth/react";

type UserProps = {
    signOut: () => void;
    onSave?: (areas: string[]) => void;
};

type Area = {
    COD_AREA: number;
    NOME_AREA: string;
    ATIVO_AREA: string;
    CHAMADO_AREA: string;
    OBS_RECAREA?: string; // existing note: optional text (will be edited)
    SELECTED?: string; // '0' or '1'
};

type RecAreaPayload = {
    COD_RECURSO: string | number;
    COD_AREA: number;
    OBS_RECAREA: string;
};

/**
 * Post an array of { COD_RECURSO, COD_AREA, OBS_RECAREA } to /api/recarea
 */
export async function postRecAreas(
    codRecurso: string | number,
    items: Array<{ COD_AREA: number; OBS_RECAREA?: string }>
): Promise<Response> {
    const payload: RecAreaPayload[] = items.map((it) => ({
        COD_RECURSO: codRecurso,
        COD_AREA: it.COD_AREA,
        OBS_RECAREA: (it.OBS_RECAREA ?? "").slice(0, 250),
    }));

    return fetch("/api/recarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

/**
 * Hook to manage OBS_RECAREA state per area (max 250 chars).
 * Returns:
 *  - obsMap: Record<COD_AREA, OBS_RECAREA>
 *  - setObs: (codArea, text) => void
 *  - ensureFromAreas: initialize map from Area[] (keeps existing keys)
 */

export function useObsMap(initialAreas: Area[] = []) {
    const [obsMap, setObsMap] = useState<Record<number, string>>(() => {
        const m: Record<number, string> = {};
        initialAreas.forEach((a) => {
            if (a.OBS_RECAREA) m[a.COD_AREA] = a.OBS_RECAREA.slice(0, 250);
        });
        return m;
    });

    const setObs = useCallback((codArea: number, text: string) => {
        setObsMap((prev) => {
            const next = { ...prev, [codArea]: text.slice(0, 250) };
            return next;
        });
    }, []);

    const ensureFromAreas = useCallback((areas: Area[]) => {
        setObsMap((prev) => {
            const next = { ...prev };
            areas.forEach((a) => {
                if (a.OBS_RECAREA && !(a.COD_AREA in next)) {
                    next[a.COD_AREA] = a.OBS_RECAREA.slice(0, 250);
                }
            });
            return next;
        });
    }, []);

    return { obsMap, setObs, ensureFromAreas };
}

export default function UserComponent({ signOut, onSave }: UserProps) {
    const [openSettings, setOpenSettings] = useState(false);
    const [availableAreas, setAvailableAreas] = useState<Area[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(false);

    const { data: session } = useSession();

    // obs map hook
    const { obsMap, setObs, ensureFromAreas } = useObsMap();

    // novo: estado de salvamento / feedback
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // load available areas from API and initialize selected from SELECTED field
    useEffect(() => {
        if (!openSettings) return;
        let mounted = true;
        setLoadingAreas(true);

        fetch("/api/area", {
            method: "POST",
            body: JSON.stringify({
                COD_RECURSO: session?.user?.recurso,
            }),
        })
            .then((res) => res.json())
            .then((data: Area[]) => {
                if (!mounted) return;
                const areas = Array.isArray(data) ? data : [];
                setAvailableAreas(areas);
                // initialize selectedAreas from SELECTED === '1'
                const initiallySelected = areas
                    .filter((a) => a.SELECTED === "1")
                    .map((a) => a.NOME_AREA);
                setSelectedAreas(initiallySelected);

                // populate obsMap from fetched areas' OBS_RECAREA
                ensureFromAreas(areas);
            })
            .catch(() => {
                if (!mounted) return;
                setAvailableAreas([]);
                setSelectedAreas([]);
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingAreas(false);
            });

        return () => {
            mounted = false;
        };
    }, [openSettings, session?.user?.recurso, ensureFromAreas]);

    const toggleArea = (name: string) => {
        setSelectedAreas((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
    };

    // Modificada: agora envia para /api/recarea os COD_AREA selecionados com suas observações
    const save = async () => {
        if (saving) return; // evita duplo envio
        // montar payload a partir das áreas disponíveis e nomes selecionados
        const items = availableAreas
            .filter((a) => selectedAreas.includes(a.NOME_AREA))
            .map((a) => ({
                COD_AREA: a.COD_AREA,
                OBS_RECAREA: obsMap[a.COD_AREA] ?? "",
            }));

        try {
            setSaving(true);
            setSaveMessage("Enviando...");
            const res = await postRecAreas(session?.user?.recurso ?? "", items);
            if (!res.ok) {
                const text = await res.text();
                console.error("Erro ao salvar áreas:", text);
                setSaveMessage("Erro ao salvar");
                // mantém botão habilitado para tentar novamente
                setSaving(false);
            } else {
                setSaveMessage("Salvo com sucesso");
                onSave?.(selectedAreas);
                // fecha modal após breve delay para usuário ver a mensagem
                setTimeout(() => {
                    setOpenSettings(false);
                    setSaving(false);
                    setSaveMessage(null);
                }, 700);
            }
        } catch (err) {
            console.error("Erro ao chamar API de recarea:", err);
            setSaveMessage("Erro ao salvar");
            setSaving(false);
        }
    };

    return (
        <header className="flex flex-col w-full p-4 gap-3">
            <div className="flex items-center justify-between w-full">
                <p className="text-blue-500 font-medium">{session?.user?.name ?? "Usuário"}</p>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => setOpenSettings(true)}
                        aria-label="Área Atuação"
                    >
                        Área Atuação
                    </button>
                    <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={signOut}
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {openSettings && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setOpenSettings(false)}
                >
                    <button
                            type="button"
                            onClick={() => setOpenSettings(false)}
                            aria-label="Fechar"
                            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 focus:outline-none z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
                    <button
                        type="button"
                        onClick={() => setOpenSettings(false)}
                        aria-label="Fechar modal"
                        className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
                        style={{ zIndex: 9999 }}
                    >
                        <span className="sr-only">Fechar</span>
                        <span aria-hidden="true" className="text-gray-700 text-lg">×</span>
                    </button>
                    <div
                        className="relative w-full max-w-md border rounded p-4 bg-white shadow-md m-4 max-h-[80vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-semibold mb-2">Áreas de atuação</h3>

                        {/* feedback aria-live */}
                        <div className="mb-2 text-sm min-h-[1.25rem]" aria-live="polite">
                            {saveMessage && <span className="text-gray-700">{saveMessage}</span>}
                        </div>

                        {loadingAreas ? (
                            <p className="text-sm text-gray-500">Carregando áreas...</p>
                        ) : (
                            <div className="mb-3">
                                {availableAreas.length === 0 && (
                                    <p className="text-sm text-gray-500">Nenhuma área disponível</p>
                                )}
                                <ul className="flex flex-col gap-2">
                                    {availableAreas.sort((a, b) => (parseInt(b.SELECTED??'0') - parseInt(a.SELECTED??'0'))).map((area) => {
                                        const name = area.NOME_AREA;
                                        const checked = selectedAreas.includes(name);
                                        return (
                                            <li key={area.COD_AREA} className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        id={`area-${area.COD_AREA}`}
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleArea(name)}
                                                        className="w-4 h-4"
                                                    />
                                                    <label htmlFor={`area-${area.COD_AREA}`} className="text-sm">
                                                        {name}
                                                    </label>
                                                </div>

                                                {/* show OBS_RECAREA textarea when selected */}
                                                {checked && (
                                                    <textarea
                                                        value={obsMap[area.COD_AREA] ?? ""}
                                                        onChange={(e) => setObs(area.COD_AREA, e.target.value)}
                                                        maxLength={250}
                                                        placeholder="Observação (máx 250 caracteres)"
                                                        className="w-full border rounded p-2 text-sm resize-y"
                                                        rows={3}
                                                    />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-1 bg-gray-200 rounded"
                                onClick={() => setOpenSettings(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-2 disabled:opacity-60"
                                onClick={save}
                                disabled={saving}
                                aria-busy={saving}
                            >
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}