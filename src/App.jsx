import { useState } from 'react'
import './App.css'
import logo from './assets/logo-betania.png'

function App() {
  const [fecha, setFecha] = useState('')
  const [primeros, setPrimeros] = useState('')
  const [segundos, setSegundos] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const MAX_PRIMEROS = 3
  const MAX_SEGUNDOS = 4
  const MAX_CARACTERES = 28

  const limpiarUrl = (url) => {
    if (!url) return ''
    return url.replace(/^=/, '')
  }

  const convertirLineas = (texto) => {
    return texto
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const validarPlatos = (primerosArray, segundosArray) => {
    if (primerosArray.length !== MAX_PRIMEROS) {
      alert(`Debes escribir exactamente ${MAX_PRIMEROS} primeros platos.`)
      return false
    }

    if (segundosArray.length !== MAX_SEGUNDOS) {
      alert(`Debes escribir exactamente ${MAX_SEGUNDOS} segundos platos.`)
      return false
    }

    const todosLosPlatos = [...primerosArray, ...segundosArray]

    for (const plato of todosLosPlatos) {
      if (plato.length > MAX_CARACTERES) {
        alert(
          `El plato "${plato}" es demasiado largo.\n\nMáximo permitido: ${MAX_CARACTERES} caracteres.`
        )
        return false
      }
    }

    return true
  }

  const generarMenu = async (e) => {
    e.preventDefault()

    const primerosArray = convertirLineas(primeros)
    const segundosArray = convertirLineas(segundos)

    if (!validarPlatos(primerosArray, segundosArray)) {
      return
    }

    const datos = {
      fecha,
      primeros: primerosArray,
      segundos: segundosArray
    }

    setCargando(true)
    setResultado(null)

    try {
      const respuesta = await fetch(
  'https://n8n-production-d92c1.up.railway.app/webhook/menu-dia',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      )

      if (!respuesta.ok) {
        throw new Error('Error en la respuesta de n8n')
      }

      const data = await respuesta.json()

      console.log('Respuesta n8n:', data)

      setResultado(data)
      setFecha('')
      setPrimeros('')
      setSegundos('')
    } catch (error) {
      console.error(error)
      alert('Error generando el menú')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <div className="card">

        <div className="header">
          <img
            src={logo}
            alt="Betania Della Chá"
            className="logo"
          />

          <p className="subtitle">
            Generador automático de menú del día
          </p>

          <p className="ayuda">
            Escribe un plato por línea. Máximo {MAX_CARACTERES} caracteres por plato.
          </p>
        </div>

        <form onSubmit={generarMenu}>

          <label>FECHA DEL MENÚ — formato 2026-05-27</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            placeholder="2026-05-27"
            required
          />

          <label>PRIMEROS — 3 platos, 1 por línea</label>

          <textarea
            value={primeros}
            onChange={(e) => setPrimeros(e.target.value)}
            placeholder={`Sopa de Sancocho
Crema de Verduras
Macarrones Carbonara`}
            required
          />

          <label>SEGUNDOS — 4 platos, 1 por línea</label>

          <textarea
            value={segundos}
            onChange={(e) => setSegundos(e.target.value)}
            placeholder={`Costillas BBQ
Pescado del día
Sobrebarriga
Hígado encebollado`}
            required
          />

          <button
            type="submit"
            disabled={
              cargando ||
              !fecha ||
              !primeros.trim() ||
              !segundos.trim()
            }
          >
            {cargando ? 'GENERANDO MENÚ...' : 'GENERAR MENÚ'}
          </button>

        </form>

        {resultado && (
          <div className="resultado">
            <h3>Menú generado correctamente</h3>

            {resultado.archivo && (
              <p>
                <strong>Archivo:</strong> {resultado.archivo}
              </p>
            )}

            {resultado.url && (
              <a
                href={limpiarUrl(resultado.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-descarga"
              >
                DESCARGAR MENÚ
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App