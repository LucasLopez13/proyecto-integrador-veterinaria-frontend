import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import { apiFetch } from "../services/apiClient";
import type { Pet } from "../types/Pet";
import type { Appointment } from "../types/Appointment";
import { FeedbackModal, type FeedbackModalState } from "../components/common/FeedbackModal";
import { ErrorModal } from "../components/common/ErrorModal";
import { BackButton } from "../components/common/BackButton";
import { FormFieldError } from "../components/common/FormFieldError";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { FileUploadZone } from "../components/common/FileUploadZone";
import { ConsultationPatientSidebar } from "../components/consultations/ConsultationPatientSidebar";
import { inventarioService } from "../services/inventarioService";
import type { ProductoConLotes } from "../types/Inventario";
import "../styles/MedicalAttention.css";
import PrescriptionForm from "../components/consultations/PrescriptionForm";
import type { Prescripcion } from "../types/Prescripcion";
import PrescriptionCard from "../components/consultations/PrescriptionCard";

interface ServicioFacturacion {
  id: number;
  nombre: string;
  precioUnitario: number;
}

interface ProductoFacturacion {
  id: number;
  nombre: string;
  precioUnitario: number;
  stockActual: number;
}

interface ConceptoSeleccionado {
  tipo: "servicio" | "producto";
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ItemConsumoClinico {
  idTemporal: string;
  productoId: number;
  productoNombre: string;
  unidadMedida: string;
  loteId: number;
  numeroLote: string;
  stockDisponibleLote: number;
  fechaVencimiento: string;
  cantidad: number;
  observaciones: string;
}

export default function MedicalAttention() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const mascotaIdParam = searchParams.get("mascotaId") || searchParams.get("mascota");
  const turnoIdParam = searchParams.get("turnoId") || searchParams.get("turno");

  const [pet, setPet] = useState<Pet | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const [consultaGuardadaId, setConsultaGuardadaId] = useState<number | null>(null);
  const [etapaAtencion, setEtapaAtencion] = useState<"soap" | "prescripciones">("soap");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: "",
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [subjetivo, setSubjetivo] = useState("");
  const [peso, setPeso] = useState<string>("");
  const [temperatura, setTemperatura] = useState<string>("");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<string>("");
  const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState<string>("");
  const [objetivo, setObjetivo] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [plan, setPlan] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [servicios, setServicios] = useState<ServicioFacturacion[]>([]);
  const [productos, setProductos] = useState<ProductoFacturacion[]>([]);
  const [tipoConcepto, setTipoConcepto] = useState<"servicio" | "producto">("servicio");
  const [referenciaId, setReferenciaId] = useState("");
  const [cantidadConcepto, setCantidadConcepto] = useState("1");
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<ConceptoSeleccionado[]>([]);
  const [errorCatalogo, setErrorCatalogo] = useState("");

  const [productosInventario, setProductosInventario] = useState<ProductoConLotes[]>([]);
  const [consumosSeleccionados, setConsumosSeleccionados] = useState<ItemConsumoClinico[]>([]);
  const [loteAbierto, setLoteAbierto] = useState<string | null>(null);
  const [productoSelId, setProductoSelId] = useState<string>("");
  const [loteSelId, setLoteSelId] = useState<string>("");
  const [cantidadConsumo, setCantidadConsumo] = useState<string>("");
  const [observacionesConsumo, setObservacionesConsumo] = useState<string>("");
  const [errorConsumo, setErrorConsumo] = useState<string | null>(null);
  const [mostrarFormularioPrescripcion, setMostrarFormularioPrescripcion] = useState(false);
  const [prescripcionesCreadas, setPrescripcionesCreadas] = useState<Prescripcion[]>([]);
  const [formularioPrescripcionKey, setFormularioPrescripcionKey] = useState(0);
  const [guardandoPrescripcion, setGuardandoPrescripcion] = useState(false);

  const handlePrescripcionConfirmada = (prescripcionActualizada: Prescripcion) => {
    setPrescripcionesCreadas((prev) =>
      prev.map((prescripcion) =>
        prescripcion.id === prescripcionActualizada.id
          ? prescripcionActualizada
          : prescripcion
      )
    );
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleError = (msg: string) => {
    setError(msg);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!mascotaIdParam) {
        handleError("No se especifico un paciente para la atencion medica.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const petData = await apiFetch<Pet>(`/mascotas/${mascotaIdParam}`);
        setPet(petData);
        if (petData.peso) {
          setPeso(String(petData.peso));
        }

        let foundApp: Appointment | null = null;
        if (turnoIdParam) {
          try {
            foundApp = await apiFetch<Appointment>(`/turnos/${turnoIdParam}`);
          } catch { }
        } else {
          try {
            const turnosRes = await apiFetch<Appointment[] | { data?: Appointment[] }>("/turnos");
            const listaTurnos = Array.isArray(turnosRes)
              ? turnosRes
              : Array.isArray(turnosRes?.data)
                ? turnosRes.data
                : [];
            const idMascotaNum = Number(mascotaIdParam);
            foundApp =
              listaTurnos.find(
                (t) =>
                  Number(t.mascotaId) === idMascotaNum &&
                  (t.estado === "confirmado" || t.estado === "pendiente")
              ) || null;
          } catch { }
        }

        let motivoTexto = "";
        let motivoInicial = "";
        if (foundApp) {
          setAppointment(foundApp);
          if (foundApp.motivo) {
            motivoTexto = foundApp.motivo.trim();
            motivoInicial = `Motivo de consulta declarado: ${motivoTexto}\n\n`;
          }
        }

        if (!motivoInicial) {
          try {
            const triages = await apiFetch<any[]>("/triage/kanban");
            if (Array.isArray(triages)) {
              const idMascotaNum = Number(mascotaIdParam);
              const triageActivo = triages.find(
                (tr) => Number(tr.mascotaId) === idMascotaNum
              );
              const textoMotivoTriage = triageActivo?.motivo || triageActivo?.sintomas;
              if (textoMotivoTriage) {
                motivoTexto = String(textoMotivoTriage).trim();
                const notasExtra = triageActivo?.notas
                  ? `\nObservaciones de Triage: ${String(triageActivo.notas).trim()}`
                  : "";
                motivoInicial = `Motivo de consulta declarado: ${motivoTexto}${notasExtra}\n\n`;
              }
            }
          } catch { }
        }

        let draftSubjetivo = "";
        const savedDraftStr = localStorage.getItem(`soap_draft_${mascotaIdParam}`);
        if (savedDraftStr) {
          try {
            const savedDraft = JSON.parse(savedDraftStr);
            if (savedDraft.subjetivo) draftSubjetivo = String(savedDraft.subjetivo);
            if (savedDraft.objetivo) setObjetivo(savedDraft.objetivo);
            if (savedDraft.peso) setPeso(savedDraft.peso);
            if (savedDraft.temperatura) setTemperatura(savedDraft.temperatura);
            if (savedDraft.frecuenciaCardiaca) setFrecuenciaCardiaca(savedDraft.frecuenciaCardiaca);
            if (savedDraft.frecuenciaRespiratoria) setFrecuenciaRespiratoria(savedDraft.frecuenciaRespiratoria);
            if (savedDraft.analisis) setAnalisis(savedDraft.analisis);
            if (savedDraft.plan) setPlan(savedDraft.plan);
            if (savedDraft.observaciones) setObservaciones(savedDraft.observaciones);
            if (Array.isArray(savedDraft.consumosSeleccionados)) {
              setConsumosSeleccionados(savedDraft.consumosSeleccionados);
            }
            if (Array.isArray(savedDraft.conceptosSeleccionados)) {
              setConceptosSeleccionados(savedDraft.conceptosSeleccionados);
            }
          } catch { }
        }

        if (draftSubjetivo.trim()) {
          if (motivoInicial && motivoTexto && !draftSubjetivo.includes(motivoTexto)) {
            setSubjetivo(`${motivoInicial}${draftSubjetivo}`);
          } else {
            setSubjetivo(draftSubjetivo);
          }
        } else if (motivoInicial) {
          setSubjetivo(motivoInicial);
        }
      } catch (err: any) {
        handleError(err.message || "Error al cargar los datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mascotaIdParam, turnoIdParam]);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [serviciosData, productosData] = await Promise.all([
          apiFetch<ServicioFacturacion[]>("/facturacion/servicios"),
          apiFetch<ProductoFacturacion[]>("/facturacion/productos"),
        ]);

        setServicios(serviciosData);
        setProductos(productosData);
      } catch (err: any) {
        setErrorCatalogo(
          err.message || "No se pudieron cargar los servicios y productos."
        );
      }
    };

    cargarCatalogos();
  }, []);

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const prods = await inventarioService.getProductosConLotes(
          token || undefined
        );
        setProductosInventario(prods);
      } catch (err: any) {
        console.error("Error al cargar productos de inventario:", err);
      }
    };

    cargarInventario();
  }, [token]);

  const agregarConcepto = () => {
    const id = Number(referenciaId);
    const cantidad = Number(cantidadConcepto);

    if (!id || !Number.isFinite(cantidad) || cantidad <= 0) {
      setErrorCatalogo("Selecciona un concepto e ingresa una cantidad valida.");
      return;
    }

    const referencia =
      tipoConcepto === "servicio"
        ? servicios.find((item) => item.id === id)
        : productos.find((item) => item.id === id);

    if (!referencia) {
      setErrorCatalogo("No se encontro el concepto seleccionado.");
      return;
    }

    if (tipoConcepto === "producto") {
      const prodFact = referencia as ProductoFacturacion;
      const yaFacturado = conceptosSeleccionados
        .filter((c) => c.tipo === "producto" && c.id === id)
        .reduce((acc, c) => acc + c.cantidad, 0);

      if (prodFact.stockActual < yaFacturado + cantidad) {
        setErrorCatalogo("La cantidad supera el stock disponible.");
        return;
      }

      const prodInv = productosInventario.find((p) => p.id === id);
      if (prodInv && prodInv.lotesDisponibles.length > 0) {
        const loteConStock =
          prodInv.lotesDisponibles.find((l) => {
            const usadoEnLote = consumosSeleccionados
              .filter((item) => item.loteId === l.id)
              .reduce((acc, curr) => acc + curr.cantidad, 0);
            return l.stockActual - usadoEnLote >= cantidad;
          }) || prodInv.lotesDisponibles[0];

        if (loteConStock) {
          setConsumosSeleccionados((prev) => {
            const idxExistente = prev.findIndex(
              (item) =>
                item.productoId === prodInv.id &&
                item.loteId === loteConStock.id
            );
            if (idxExistente >= 0) {
              return prev.map((item, idx) =>
                idx === idxExistente
                  ? {
                    ...item,
                    cantidad: Number((item.cantidad + cantidad).toFixed(2)),
                  }
                  : item
              );
            }
            return [
              ...prev,
              {
                idTemporal: `${Date.now()}_${Math.random()}`,
                productoId: prodInv.id,
                productoNombre: prodInv.nombre,
                unidadMedida: prodInv.unidadMedida,
                loteId: loteConStock.id,
                numeroLote: loteConStock.numeroLote,
                stockDisponibleLote: loteConStock.stockActual,
                fechaVencimiento: loteConStock.fechaVencimiento,
                cantidad,
                observaciones: "Sincronizado con facturacion",
              },
            ];
          });
        }
      }
    }

    setConceptosSeleccionados((prev) => {
      const idxExistente = prev.findIndex(
        (c) => c.tipo === tipoConcepto && c.id === id
      );
      if (idxExistente >= 0) {
        return prev.map((c, idx) =>
          idx === idxExistente
            ? { ...c, cantidad: Number((c.cantidad + cantidad).toFixed(2)) }
            : c
        );
      }
      return [
        ...prev,
        {
          tipo: tipoConcepto,
          id,
          nombre: referencia.nombre,
          precio: Number(referencia.precioUnitario),
          cantidad,
        },
      ];
    });

    setReferenciaId("");
    setCantidadConcepto("1");
    setErrorCatalogo("");
  };

  const handleQuitarConcepto = (index: number) => {
    const conceptoQuitado = conceptosSeleccionados[index];
    setConceptosSeleccionados((prev) => prev.filter((_, i) => i !== index));
    if (conceptoQuitado && conceptoQuitado.tipo === "producto") {
      setConsumosSeleccionados((prev) =>
        prev.filter((item) => item.productoId !== conceptoQuitado.id)
      );
    }
  };

  const productoActual = productosInventario.find(
    (p) => String(p.id) === String(productoSelId)
  );

  const lotesDisponibles = productoActual
    ? productoActual.lotesDisponibles
    : [];

  const loteActual = lotesDisponibles.find(
    (l) => String(l.id) === String(loteSelId)
  );

  const handleAgregarConsumo = () => {
    setErrorConsumo(null);

    if (!productoSelId || !productoActual) {
      setErrorConsumo(
        "Por favor selecciona un medicamento o insumo de la lista."
      );
      return;
    }

    if (!loteSelId || !loteActual) {
      setErrorConsumo("Por favor selecciona un lote disponible con stock.");
      return;
    }

    const cant = parseFloat(cantidadConsumo);

    if (isNaN(cant) || cant <= 0) {
      setErrorConsumo("La cantidad debe ser un numero mayor a 0.");
      return;
    }

    const consumidoPrevio = consumosSeleccionados
      .filter((item) => item.loteId === loteActual.id)
      .reduce((acc, curr) => acc + curr.cantidad, 0);

    const stockRestante = loteActual.stockActual - consumidoPrevio;

    if (cant > stockRestante) {
      setErrorConsumo(
        `Stock insuficiente en el lote ${loteActual.numeroLote}. Disponible: ${stockRestante} ${productoActual.unidadMedida}.`
      );
      return;
    }

    const nuevoItem: ItemConsumoClinico = {
      idTemporal: `${Date.now()}_${Math.random()}`,
      productoId: productoActual.id,
      productoNombre: productoActual.nombre,
      unidadMedida: productoActual.unidadMedida,
      loteId: loteActual.id,
      numeroLote: loteActual.numeroLote,
      stockDisponibleLote: loteActual.stockActual,
      fechaVencimiento: loteActual.fechaVencimiento,
      cantidad: cant,
      observaciones: observacionesConsumo.trim(),
    };

    setConsumosSeleccionados((prev) => [...prev, nuevoItem]);

    const prodFact = productos.find((p) => p.id === productoActual.id);
    if (prodFact) {
      setConceptosSeleccionados((prev) => {
        const idxExistente = prev.findIndex(
          (c) => c.tipo === "producto" && c.id === prodFact.id
        );
        if (idxExistente >= 0) {
          return prev.map((c, idx) =>
            idx === idxExistente
              ? { ...c, cantidad: Number((c.cantidad + cant).toFixed(2)) }
              : c
          );
        }
        return [
          ...prev,
          {
            tipo: "producto",
            id: prodFact.id,
            nombre: prodFact.nombre,
            precio: Number(prodFact.precioUnitario),
            cantidad: cant,
          },
        ];
      });
    }

    setCantidadConsumo("");
    setObservacionesConsumo("");
    setErrorConsumo(null);
  };

  const handleEliminarConsumo = (idTemporal: string) => {
    const itemEliminado = consumosSeleccionados.find(
      (item) => item.idTemporal === idTemporal
    );
    setConsumosSeleccionados((prev) =>
      prev.filter((item) => item.idTemporal !== idTemporal)
    );
    if (itemEliminado) {
      setConceptosSeleccionados((prev) =>
        prev
          .map((c) => {
            if (c.tipo === "producto" && c.id === itemEliminado.productoId) {
              const nuevaCantidad = Number(
                (c.cantidad - itemEliminado.cantidad).toFixed(2)
              );
              return nuevaCantidad > 0 ? { ...c, cantidad: nuevaCantidad } : null;
            }
            return c;
          })
          .filter((c): c is ConceptoSeleccionado => c !== null)
      );
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (consultaGuardadaId !== null) {
      handleError(
        "La consulta SOAP ya fue registrada. No es necesario volver a guardarla."
      );
      return;
    }

    if (saving || isSubmittingRef.current) {
      return;
    }

    if (!token) {
      handleError("No hay sesion activa.");
      return;
    }

    if (!pet) {
      handleError("No se encontro el paciente.");
      return;
    }

    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    const parsedPeso = parseFloat(peso);
    if (!peso.trim()) {
      newErrors.peso = "Completa este campo con el peso en consulta";
    } else if (isNaN(parsedPeso) || parsedPeso <= 0) {
      newErrors.peso = "Ingresa un peso valido mayor a 0 kg";
    }

    if (!subjetivo.trim()) {
      newErrors.subjetivo = "Completa este campo con la anamnesis o motivo de consulta";
    }

    const parsedTemp = parseFloat(temperatura);
    if (!temperatura.trim()) {
      newErrors.temperatura = "Completa este campo con la temperatura en °C";
    } else if (isNaN(parsedTemp) || parsedTemp < 30 || parsedTemp > 45) {
      newErrors.temperatura = "Ingresa una temperatura valida (entre 30 y 45 °C)";
    }

    if (frecuenciaCardiaca.trim()) {
      const fcNum = parseInt(frecuenciaCardiaca, 10);
      if (isNaN(fcNum) || fcNum < 20 || fcNum > 300) {
        newErrors.frecuenciaCardiaca = "La frecuencia cardiaca debe estar entre 20 y 300 lpm";
      }
    }

    if (frecuenciaRespiratoria.trim()) {
      const frNum = parseInt(frecuenciaRespiratoria, 10);
      if (isNaN(frNum) || frNum < 5 || frNum > 150) {
        newErrors.frecuenciaRespiratoria = "La frecuencia respiratoria debe estar entre 5 y 150 rpm";
      }
    }

    if (!objetivo.trim()) {
      newErrors.objetivo = "Completa este campo con el examen fisico y hallazgos";
    }

    if (!analisis.trim()) {
      newErrors.analisis = "Completa este campo con el diagnostico o juicio clinico";
    }

    if (!plan.trim()) {
      newErrors.plan = "Completa este campo con el plan terapeutico o indicaciones";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const fieldOrder = [
        { key: "peso", id: "patient-weigh-in" },
        { key: "subjetivo", id: "subjetivo" },
        { key: "temperatura", id: "temperatura" },
        { key: "frecuenciaCardiaca", id: "fc" },
        { key: "frecuenciaRespiratoria", id: "fr" },
        { key: "objetivo", id: "objetivo" },
        { key: "analisis", id: "analisis" },
        { key: "plan", id: "plan" },
      ];
      const firstInvalid = fieldOrder.find((f) => newErrors[f.key]);
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid.id);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    try {
      isSubmittingRef.current = true;
      setSaving(true);
      setError(null);

      const turnoVinculadoId =
        appointment?.id ?? (turnoIdParam ? parseInt(turnoIdParam, 10) : null);

      const resultado = await consultationService.createConsultation(
        {
          mascotaId: pet.id,
          turnoId: turnoVinculadoId,
          subjetivo: subjetivo.trim(),
          objetivo: objetivo.trim(),
          peso: parsedPeso,
          temperatura: parsedTemp,
          frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca, 10) : null,
          frecuenciaRespiratoria: frecuenciaRespiratoria ? parseInt(frecuenciaRespiratoria, 10) : null,
          analisis: analisis.trim(),
          plan: plan.trim(),
          observaciones: observaciones.trim() || null,
          consumosStock: consumosSeleccionados.map((item) => ({
            productoId: item.productoId,
            loteId: item.loteId,
            cantidad: item.cantidad,
            observaciones: item.observaciones || undefined,
          })),
        },
        token
      );

      const consultaId = resultado.id;

      if (!consultaId) {
        throw new Error("La consulta se guardo, pero no se recibio su identificador.");
      }
      setConsultaGuardadaId(consultaId);
      for (const concepto of conceptosSeleccionados) {
        await apiFetch(`/facturacion/consultas/${consultaId}/conceptos`, {
          method: "POST",
          body: JSON.stringify({
            servicioId: concepto.tipo === "servicio" ? concepto.id : null,
            productoId: concepto.tipo === "producto" ? concepto.id : null,
            cantidad: concepto.cantidad,
          }),
        });
      }

      for (const file of attachedFiles) {
        try {
          const formData = new FormData();
          formData.append("archivo", file);
          formData.append("nombre", file.name);
          formData.append("mascotaId", String(pet.id));

          await apiFetch("/archivos-medicos", {
            method: "POST",
            body: formData,
          });
        } catch { }
      }

      if (mascotaIdParam) {
        localStorage.removeItem(`soap_draft_${mascotaIdParam}`);
      }

      setSuccessMsg("Consulta SOAP guardada correctamente. Ahora podes generar prescripciones.");

      setEtapaAtencion("prescripciones");
      setSaving(false);
      isSubmittingRef.current = false;

    } catch (err: any) {
      isSubmittingRef.current = false;
      setSaving(false);
      handleError(err.message || "Error al registrar la atencion medica");
    }
  };

  const handleSaveDraft = () => {
    if (!mascotaIdParam) return;
    const draft = {
      subjetivo,
      objetivo,
      peso,
      temperatura,
      frecuenciaCardiaca,
      frecuenciaRespiratoria,
      analisis,
      plan,
      observaciones,
      consumosSeleccionados,
      conceptosSeleccionados,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`soap_draft_${mascotaIdParam}`, JSON.stringify(draft));
    setSuccessMsg("Borrador guardado localmente en esta estacion de trabajo.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const solicitarFinalizarAtencion = () => {
    const pendientesConfirmacion = prescripcionesCreadas.filter(
      (p) => !p.confirmadaPorProfesional
    ).length;

    const navegarDestino = () => {
      if (turnoIdParam || appointment?.id) {
        navigate("/profesional/turnos");
      } else {
        navigate(`/profesional/mascotas/${pet?.id}`);
      }
    };

    if (pendientesConfirmacion > 0) {
      setFeedbackModal({
        isOpen: true,
        type: "confirm",
        confirmVariant: "primary",
        title: "Prescripciones sin confirmar",
        message: `Tenes ${pendientesConfirmacion} prescripcion(es) pendiente(s) de confirmacion profesional. ¿Deseas finalizar la atencion de todos modos?`,
        confirmText: "Si, finalizar atencion",
        cancelText: "Volver a revisar",
        onConfirm: navegarDestino,
      });
      return;
    }

    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      confirmVariant: "primary",
      title: "Finalizar Atencion Clinica",
      message: `¿Confirmas el cierre de la estacion de atencion para ${pet?.nombre || "el paciente"}?`,
      confirmText: "Finalizar y salir",
      cancelText: "Permanecer aqui",
      onConfirm: navegarDestino,
    });
  };

  if (etapaAtencion === "prescripciones" && consultaGuardadaId !== null) {
    return (
      <main className="medical-attention-page">
        <div className="container-fluid px-lg-5 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                  color: "var(--vet-primary, #6D28D9)",
                  border: "1px solid var(--vet-border-tint, #EDE9FE)",
                  fontSize: "1.4rem",
                }}
              >
                <i className="bi bi-capsule-pill"></i>
              </div>
              <div>
                <h1
                  className="h4 fw-bold mb-0"
                  style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                >
                  Prescripciones Medicas y Posologia
                </h1>
                <p className="text-muted small mb-0">
                  Consulta SOAP #{consultaGuardadaId} registrada para{" "}
                  <strong>{pet?.nombre}</strong> · Peso de calculo:{" "}
                  <strong>{peso} kg</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: "var(--vet-primary, #6D28D9)",
                borderColor: "var(--vet-primary, #6D28D9)",
              }}
              onClick={solicitarFinalizarAtencion}
            >
              <i className="bi bi-check2-all"></i>
              Finalizar atencion
            </button>
          </div>

          <div className="row g-4">
            <ConsultationPatientSidebar
              pet={pet}
              appointment={appointment}
              peso={peso}
              onPesoChange={setPeso}
              onClearPesoError={() => { }}
            />

            <div className="col-12 col-lg-8">
              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div
                    className="soap-badge-letter"
                    style={{
                      backgroundColor: "#ECFDF5",
                      color: "#059669",
                      border: "1px solid #A7F3D0",
                    }}
                  >
                    <i className="bi bi-check2"></i>
                  </div>
                  <div>
                    <h2
                      className="h6 fw-bold mb-0"
                      style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                    >
                      Consulta SOAP #{consultaGuardadaId} Guardada Exitosamente
                    </h2>
                    <small className="text-muted">
                      Podes emitir recetas con calculo posologico automatico o
                      finalizar la atencion clinica
                    </small>
                  </div>
                </div>

                <div
                  className="rounded-3 p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                  style={{
                    backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                    border: "1px solid var(--vet-border-tint, #EDE9FE)",
                  }}
                >
                  <div className="small">
                    <span
                      className="fw-bold d-block"
                      style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                    >
                      Recetario y Calculadora Posologica Dinamica
                    </span>
                    <span className="text-muted">
                      Paciente: <strong>{pet?.nombre}</strong> · Peso registrado:{" "}
                      <strong>{peso} kg</strong> · Prescripciones emitidas:{" "}
                      <strong>{prescripcionesCreadas.length}</strong>
                    </span>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    {!mostrarFormularioPrescripcion ? (
                      <button
                        type="button"
                        className="btn btn-primary rounded-2 shadow-sm px-3 fw-medium d-inline-flex align-items-center gap-2"
                        style={{
                          backgroundColor: "var(--vet-primary, #6D28D9)",
                          borderColor: "var(--vet-primary, #6D28D9)",
                        }}
                        onClick={() => {
                          setFormularioPrescripcionKey((prev) => prev + 1);
                          setMostrarFormularioPrescripcion(true);
                        }}
                      >
                        <i className="bi bi-plus-circle"></i>
                        Nueva prescripcion
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-2 btn-sm px-3 fw-medium"
                        onClick={() => setMostrarFormularioPrescripcion(false)}
                        disabled={guardandoPrescripcion}
                      >
                        Cancelar formulario
                      </button>
                    )}
                  </div>
                </div>

                {mostrarFormularioPrescripcion && (
                  <div className="mb-4">
                    <PrescriptionForm
                      key={formularioPrescripcionKey}
                      consultaId={consultaGuardadaId}
                      pesoKg={parseFloat(peso) || pet?.peso || 0}
                      token={token}
                      onSavingChange={setGuardandoPrescripcion}
                      onPrescripcionCreada={(prescripcion) => {
                        setPrescripcionesCreadas((prev) => [
                          ...prev,
                          prescripcion,
                        ]);
                        setMostrarFormularioPrescripcion(false);
                      }}
                    />
                  </div>
                )}

                {prescripcionesCreadas.length > 0 ? (
                  <div className="mt-3">
                    <h4
                      className="h6 fw-bold mb-3"
                      style={{ color: "var(--vet-text-main, #1E1B4B)" }}
                    >
                      Prescripciones registradas en esta atencion (
                      {prescripcionesCreadas.length})
                    </h4>
                    {prescripcionesCreadas.map((prescripcion) => (
                      <PrescriptionCard
                        key={prescripcion.id}
                        prescripcion={prescripcion}
                        token={token}
                        onConfirmada={handlePrescripcionConfirmada}
                      />
                    ))}
                  </div>
                ) : (
                  !mostrarFormularioPrescripcion && (
                    <div
                      className="text-center py-4 rounded-3 border"
                      style={{
                        backgroundColor: "#FAF9FC",
                        borderColor: "var(--vet-border-tint, #EDE9FE)",
                      }}
                    >
                      <i
                        className="bi bi-File-medical fs-3 d-block mb-2"
                        style={{ color: "var(--vet-primary, #6D28D9)" }}
                      ></i>
                      <p className="small text-muted mb-0">
                        No se agregaron prescripciones farmacologicas todavia.
                        Hace clic en <strong>Nueva prescripcion</strong> si
                        necesitas recetar medicacion.
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <FeedbackModal
            isOpen={feedbackModal.isOpen}
            type={feedbackModal.type}
            confirmVariant={feedbackModal.confirmVariant}
            title={feedbackModal.title}
            message={feedbackModal.message}
            confirmText={feedbackModal.confirmText}
            cancelText={feedbackModal.cancelText}
            onConfirm={feedbackModal.onConfirm}
            onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
          />
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="medical-attention-page">
        <LoadingSpinner message="Cargando estacion de consulta..." />
      </main>
    );
  }

  if (error && !pet) {
    return (
      <main className="medical-attention-page">
        <div className="container py-5" style={{ maxWidth: "600px" }}>
          <EmptyState
            icon="bi-clipboard2-x"
            title="Paciente o atencion no disponible"
            description="La mascota indicada para esta consulta no existe o no se encontro en el sistema."
            actionText="Volver a la Agenda"
            actionTo="/profesional/turnos"
            actionIcon="bi-arrow-left"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="medical-attention-page">
      <div className="container-fluid px-lg-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                color: "var(--vet-primary, #6D28D9)",
                border: "1px solid var(--vet-border-tint, #EDE9FE)",
                fontSize: "1.4rem"
              }}
            >
              <i className="bi bi-clipboard2-pulse"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--vet-text-main, #1E1B4B)" }}>
                Estacion de Consulta Clinica (SOAP)
              </h1>
              <p className="text-muted small mb-0">
                Atencion en curso para <strong>{pet?.nombre}</strong>
                {appointment && ` · Turno #${appointment.id}`} · Registro inmutable
              </p>
            </div>
          </div>

          <BackButton
            to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
            text="Volver"
            variant="outline"
          />
        </div>

        {error && <div className="alert alert-danger rounded-2 shadow-sm mb-4">{error}</div>}
        {successMsg && <div className="alert alert-success rounded-2 shadow-sm mb-4">{successMsg}</div>}

        <div className="row g-4">
          <ConsultationPatientSidebar
            pet={pet}
            appointment={appointment}
            peso={peso}
            onPesoChange={setPeso}
            onClearPesoError={() => clearFieldError("peso")}
            pesoError={fieldErrors.peso}
          />

          <div className="col-12 col-lg-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-s">S</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Subjetivo (Anamnesis)</h2>
                    <small className="text-muted">Motivo de consulta, sintomas declarados y tiempo de evolucion</small>
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor="subjetivo" className="form-label small fw-semibold text-muted">
                    Anamnesis clinica / Motivo <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="subjetivo"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.subjetivo ? "is-invalid" : ""}`}
                    placeholder="Subjetivo (Anamnesis y motivo de consulta)"
                    value={subjetivo}
                    onChange={(e) => {
                      setSubjetivo(e.target.value);
                      clearFieldError("subjetivo");
                    }}
                  />
                  <FormFieldError error={fieldErrors.subjetivo} />
                </div>
              </div>



              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-o">O</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Objetivo (Constantes y Examen Fisico)</h2>
                    <small className="text-muted">Parametros fisiologicos medidos y hallazgos a la inspeccion</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-4">
                    <label htmlFor="temperatura" className="form-label small fw-semibold text-muted">
                      Temperatura (°C) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="temperatura"
                        type="number"
                        step="0.1"
                        min="30"
                        max="45"
                        placeholder="Temperatura en °C"
                        className={`form-control rounded-2 ${fieldErrors.temperatura ? "is-invalid" : ""}`}
                        value={temperatura}
                        onChange={(e) => {
                          setTemperatura(e.target.value);
                          clearFieldError("temperatura");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">°C</span>
                    </div>
                    <FormFieldError error={fieldErrors.temperatura} />
                  </div>

                  <div className="col-sm-4">
                    <label htmlFor="fc" className="form-label small fw-semibold text-muted">
                      Frec. Cardiaca (lpm)
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="fc"
                        type="number"
                        min="20"
                        max="300"
                        placeholder="Frecuencia cardiaca (lpm)"
                        className={`form-control rounded-2 ${fieldErrors.frecuenciaCardiaca ? "is-invalid" : ""}`}
                        value={frecuenciaCardiaca}
                        onChange={(e) => {
                          setFrecuenciaCardiaca(e.target.value);
                          clearFieldError("frecuenciaCardiaca");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">lpm</span>
                    </div>
                    <FormFieldError error={fieldErrors.frecuenciaCardiaca} />
                  </div>

                  <div className="col-sm-4">
                    <label htmlFor="fr" className="form-label small fw-semibold text-muted">
                      Frec. Respiratoria (rpm)
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        id="fr"
                        type="number"
                        min="5"
                        max="150"
                        placeholder="Frecuencia respiratoria (rpm)"
                        className={`form-control rounded-2 ${fieldErrors.frecuenciaRespiratoria ? "is-invalid" : ""}`}
                        value={frecuenciaRespiratoria}
                        onChange={(e) => {
                          setFrecuenciaRespiratoria(e.target.value);
                          clearFieldError("frecuenciaRespiratoria");
                        }}
                      />
                      <span className="input-group-text rounded-2 ms-1">rpm</span>
                    </div>
                    <FormFieldError error={fieldErrors.frecuenciaRespiratoria} />
                  </div>
                </div>

                <div>
                  <label htmlFor="objetivo" className="form-label small fw-semibold text-muted">
                    Examen Fisico / Hallazgos Clinicos <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="objetivo"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.objetivo ? "is-invalid" : ""}`}
                    placeholder="Objetivo (Examen fisico y hallazgos)"
                    value={objetivo}
                    onChange={(e) => {
                      setObjetivo(e.target.value);
                      clearFieldError("objetivo");
                    }}
                  />
                  <FormFieldError error={fieldErrors.objetivo} />
                </div>
              </div>

              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-a">A</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Analisis (Diagnostico)</h2>
                    <small className="text-muted">Diagnostico presuntivo o definitivo y juicio profesional</small>
                  </div>
                </div>

                <div>
                  <label htmlFor="analisis" className="form-label small fw-semibold text-muted">
                    Diagnostico Clinico <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="analisis"
                    rows={2}
                    className={`form-control rounded-2 ${fieldErrors.analisis ? "is-invalid" : ""}`}
                    placeholder="Analisis (Diagnostico clinico)"
                    value={analisis}
                    onChange={(e) => {
                      setAnalisis(e.target.value);
                      clearFieldError("analisis");
                    }}
                  />
                  <FormFieldError error={fieldErrors.analisis} />
                </div>
              </div>

              <div className="soap-section-card">
                <div className="soap-section-header">
                  <div className="soap-badge-letter badge-p">P</div>
                  <div>
                    <h2 className="h6 fw-bold mb-0 text-dark">Plan (Tratamiento y Prescripcion)</h2>
                    <small className="text-muted">Indicaciones farmacologicas, posologia, estudios solicitados y recomendaciones</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="plan" className="form-label small fw-semibold text-muted">
                    Tratamiento y Medicacion Indicada <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="plan"
                    rows={3}
                    className={`form-control rounded-2 ${fieldErrors.plan ? "is-invalid" : ""}`}
                    placeholder="Plan (Tratamiento y prescripcion)"
                    value={plan}
                    onChange={(e) => {
                      setPlan(e.target.value);
                      clearFieldError("plan");
                    }}
                  />
                  <FormFieldError error={fieldErrors.plan} />
                </div>

                <div>
                  <label htmlFor="observaciones" className="form-label small fw-semibold text-muted">
                    Observaciones y Pautas de Alarma para el Tutor
                  </label>
                  <textarea
                    id="observaciones"
                    rows={2}
                    className="form-control rounded-2"
                    placeholder="Observaciones y pautas de control"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
              </div>
              <div className="soap-section-card">
                <div className="soap-section-header">
                  <span
                    className="soap-badge-letter"
                    style={{
                      backgroundColor: "var(--vet-subtle-lavender, #F5F3FF)",
                      color: "var(--vet-primary, #6D28D9)",
                      border: "1px solid var(--vet-border-tint, #EDE9FE)",
                    }}
                  >
                    <i className="bi bi-receipt"></i>
                  </span>
                  <div>
                    <h3 className="h6 fw-bold mb-0 text-dark">
                      Servicios y productos facturables
                    </h3>
                    <small className="text-muted">
                      Se incluiran en la orden de facturacion. Los productos se sincronizan automaticamente con Insumos y Farmacia Administrada.
                    </small>
                  </div>
                </div>

                {errorCatalogo && (
                  <div className="alert alert-warning py-2 small rounded-2">{errorCatalogo}</div>
                )}

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Tipo</label>
                      <select
                        className="form-select form-select-sm"
                        value={tipoConcepto}
                        onChange={(e) => {
                          setTipoConcepto(e.target.value as "servicio" | "producto");
                          setReferenciaId("");
                        }}
                      >
                        <option value="servicio">Servicio</option>
                        <option value="producto">Producto</option>
                      </select>
                    </div>

                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-muted mb-1">
                        {tipoConcepto === "servicio" ? "Servicio" : "Producto"}
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={referenciaId}
                        onChange={(e) => setReferenciaId(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {(tipoConcepto === "servicio" ? servicios : productos).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre} - ${Number(item.precioUnitario).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-muted mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={cantidadConcepto}
                        onChange={(e) => setCantidadConcepto(e.target.value)}
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm w-100"
                        style={{
                          backgroundColor: "var(--vet-primary, #6D28D9)",
                          borderColor: "var(--vet-primary, #6D28D9)",
                        }}
                        onClick={agregarConcepto}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {conceptosSeleccionados.length > 0 && (
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-hover align-middle border mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Concepto</th>
                          <th>Tipo</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                          <th className="text-end">Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conceptosSeleccionados.map((concepto, index) => (
                          <tr key={`${concepto.tipo}-${concepto.id}-${index}`}>
                            <td className="fw-semibold text-dark">{concepto.nombre}</td>
                            <td>
                              <span
                                className="badge rounded-pill text-capitalize"
                                style={{
                                  backgroundColor:
                                    concepto.tipo === "servicio" ? "#F5F3FF" : "#EEF2FF",
                                  color:
                                    concepto.tipo === "servicio" ? "#6D28D9" : "#4F46E5",
                                }}
                              >
                                {concepto.tipo}
                              </span>
                            </td>
                            <td>{concepto.cantidad}</td>
                            <td>${concepto.precio.toFixed(2)}</td>
                            <td className="fw-semibold">
                              ${(concepto.precio * concepto.cantidad).toFixed(2)}
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                onClick={() => handleQuitarConcepto(index)}
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="soap-section-card">
                <div className="soap-section-header">
                  <span
                    className="soap-badge-letter"
                    style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}
                  >
                    <i className="bi bi-capsule"></i>
                  </span>
                  <div>
                    <h2 className="h5 fw-bold mb-0 text-dark">
                      Insumos y Farmacia Administrada (Consumo Fraccionado)
                    </h2>
                    <p className="text-muted small mb-0">
                      Debita automaticamente del stock por lote y se sincroniza con los productos facturables de la consulta.
                    </p>
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="row g-2 align-items-end">
                    <div className="col-12 col-md-4">
                      <label htmlFor="selectProductoStock" className="form-label small fw-semibold text-muted mb-1">
                        Medicamento / Insumo
                      </label>
                      <select
                        id="selectProductoStock"
                        className="form-select form-select-sm"
                        value={productoSelId}
                        onChange={(e) => {
                          setProductoSelId(e.target.value);
                          setLoteSelId("");
                          setErrorConsumo(null);
                        }}
                      >
                        <option value="">-- Seleccionar producto --</option>
                        {productosInventario.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre} (Disp: {prod.stockActual} {prod.unidadMedida})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label htmlFor="selectLoteStock" className="form-label small fw-semibold text-muted mb-1">
                        Lote y Vencimiento
                      </label>
                      <select
                        id="selectLoteStock"
                        className="form-select form-select-sm"
                        value={loteSelId}
                        onChange={(e) => {
                          setLoteSelId(e.target.value);
                          setErrorConsumo(null);
                        }}
                        disabled={!productoSelId}
                      >
                        <option value="">-- Seleccionar lote --</option>
                        {lotesDisponibles.map((lote) => (
                          <option key={lote.id} value={lote.id}>
                            Lote {lote.numeroLote} ({lote.stockActual} {productoActual?.unidadMedida} - Vence {lote.fechaVencimiento})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-2">
                      <label htmlFor="inputCantidadConsumo" className="form-label small fw-semibold text-muted mb-1">
                        Cantidad ({productoActual?.unidadMedida || "unid."})
                      </label>
                      <input
                        id="inputCantidadConsumo"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ej: 1.5"
                        className="form-control form-control-sm"
                        value={cantidadConsumo}
                        onChange={(e) => {
                          setCantidadConsumo(e.target.value);
                          setErrorConsumo(null);
                        }}
                        disabled={!loteSelId}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label htmlFor="inputObservacionesConsumo" className="form-label small fw-semibold text-muted mb-1">
                        Detalle / Observacion
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          id="inputObservacionesConsumo"
                          type="text"
                          placeholder="Ej: Administrado SC"
                          className="form-control form-control-sm"
                          value={observacionesConsumo}
                          onChange={(e) => setObservacionesConsumo(e.target.value)}
                          disabled={!loteSelId}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-3 text-nowrap"
                          onClick={handleAgregarConsumo}
                          disabled={!loteSelId || !cantidadConsumo}
                          style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                        >
                          <i className="bi bi-plus-lg me-1"></i> Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {errorConsumo && (
                    <div className="alert alert-warning py-1 px-2 mt-2 mb-0 small rounded-2">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {errorConsumo}
                    </div>
                  )}

                  {productoActual && lotesDisponibles.length === 0 && (
                    <div className="alert alert-secondary py-1 px-2 mt-2 mb-0 small rounded-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Este producto no cuenta con lotes activos o con stock disponible en este momento.
                    </div>
                  )}
                </div>

                {consumosSeleccionados.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle border mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th>Insumo / Farmaco</th>
                          <th>Lote / Vencimiento</th>
                          <th className="text-center">Cantidad Debitada</th>
                          <th>Observaciones</th>
                          <th className="text-end">Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumosSeleccionados.map((item) => {
                          const abierto = loteAbierto === item.idTemporal;

                          return (
                            <>
                              <tr
                                key={item.idTemporal}
                                onClick={() =>
                                  setLoteAbierto(abierto ? null : item.idTemporal)
                                }
                                style={{
                                  borderBottom: abierto ? "none" : "1px solid #F1F5F9",
                                  cursor: "pointer",
                                }}
                              >
                                <td className="fw-semibold text-dark">
                                  {item.productoNombre}
                                </td>

                                <td>
                                  <span className="badge bg-secondary-subtle text-secondary me-1">
                                    Lote {item.numeroLote}
                                  </span>
                                  <span className="text-muted small">
                                    Vence: {item.fechaVencimiento}
                                  </span>
                                </td>

                                <td className="text-center">
                                  <span className="badge bg-primary-subtle text-primary fw-bold px-2 py-1">
                                    {item.cantidad} {item.unidadMedida}
                                  </span>
                                </td>

                                <td className="text-muted">
                                  {item.observaciones || "-"}
                                </td>

                                <td className="text-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm py-0 px-2"
                                    title="Eliminar de la atencion"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEliminarConsumo(item.idTemporal);
                                    }}
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                </td>
                              </tr>

                              {abierto && (
                                <tr key={`${item.idTemporal}-detalle`}>
                                  <td colSpan={5} className="bg-light border-0">
                                    <div className="p-3">
                                      <div className="row g-3">
                                        <div className="col-md-4">
                                          <div className="text-muted small">
                                            Número de lote
                                          </div>
                                          <div className="fw-semibold">
                                            Lote {item.numeroLote}
                                          </div>
                                        </div>

                                        <div className="col-md-4">
                                          <div className="text-muted small">
                                            Fecha de vencimiento
                                          </div>
                                          <div className="fw-semibold">
                                            {item.fechaVencimiento}
                                          </div>
                                        </div>

                                        <div className="col-md-4">
                                          <div className="text-muted small">
                                            Stock disponible del lote
                                          </div>
                                          <div className="fw-semibold">
                                            {item.stockDisponibleLote} {item.unidadMedida}
                                          </div>
                                        </div>

                                        <div className="col-md-4">
                                          <div className="text-muted small">
                                            Cantidad debitada
                                          </div>
                                          <div className="fw-semibold">
                                            {item.cantidad} {item.unidadMedida}
                                          </div>
                                        </div>

                                        <div className="col-md-8">
                                          <div className="text-muted small">
                                            Observaciones
                                          </div>
                                          <div className="fw-semibold">
                                            {item.observaciones || "-"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted small fst-italic mb-0 text-center py-2 border rounded-2 bg-light">
                    No se han registrado consumos de farmacia para esta consulta (opcional).
                  </p>
                )}
              </div>

              <div className="soap-section-card">
                <h3 className="h6 fw-bold mb-2 text-dark">Estudios Complementarios & Archivos</h3>
                <p className="text-muted small mb-3">Adjuntar analisis de laboratorio, RX o ecografias a esta consulta</p>
                <FileUploadZone
                  files={attachedFiles}
                  onFilesAdded={(newFiles) => setAttachedFiles((prev) => [...prev, ...newFiles])}
                  onRemoveFile={(index) => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                  onError={handleError}
                />
              </div>

              <div className="soap-actions-bar">
                <Link
                  to={turnoIdParam ? "/profesional/turnos" : `/profesional/mascotas/${pet?.id}`}
                  className="btn btn-outline-secondary rounded-2 px-3 fw-medium"
                >
                  Cancelar
                </Link>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-outline-primary rounded-2 px-3 fw-medium"
                >
                  Guardar Borrador
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-2 shadow-sm px-4 fw-medium"
                  style={{ backgroundColor: "var(--vet-primary, #6D28D9)", borderColor: "var(--vet-primary, #6D28D9)" }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Guardando consulta...
                    </>
                  ) : (
                    "Guardar SOAP y continuar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          confirmText={feedbackModal.confirmText}
          cancelText={feedbackModal.cancelText}
          onConfirm={feedbackModal.onConfirm}
          onClose={() => setFeedbackModal({ isOpen: false, message: "" })}
        />

        <ErrorModal
          error={error}
          title="Error en Consulta SOAP"
          onClose={() => setError(null)}
        />
      </div>
    </main>
  );
}
