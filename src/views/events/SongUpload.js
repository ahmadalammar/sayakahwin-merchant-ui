import React, { useRef, useState, useEffect, useMemo } from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilMediaPlay, cilMediaPause, cilMusicNote } from '@coreui/icons'
import config from 'src/config'

const SongUpload = ({ song, setSong }) => {
  const fileInput = useRef(null)
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const getSongUrl = () => {
    if (!song) return null
    if (typeof song === 'string') {
      // Handle empty string
      if (song.trim() === '') return null
      // If it's already a full URL (http/https), return as is
      if (song.startsWith('http://') || song.startsWith('https://')) {
        return song
      }
      // Otherwise, prepend API base URL
      return `${config.API_BASE_URL}${song.startsWith('/') ? song : `/${song}`}`
    }
    // If it's an object with preview, return preview
    if (song.preview) {
      return song.preview
    }
    return null
  }

  const songUrl = useMemo(() => getSongUrl(), [song])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !songUrl) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e) => {
      console.error('Audio loading error:', e)
      setIsPlaying(false)
    }
    const handleLoadedMetadata = () => {
      updateDuration()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Load the audio source
    audio.load()

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [songUrl])

  const handleSongChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (e.g., 50MB max for audio files)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`)
        return
      }
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        alert(`File ${file.name} is not an audio file. Please select an audio file.`)
        return
      }
      setSong({
        file,
        preview: URL.createObjectURL(file),
      })
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const handleRemoveSong = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setSong(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err)
        setIsPlaying(false)
      })
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFileName = () => {
    if (!song) return ''
    if (typeof song === 'string') {
      // Extract filename from URL
      const urlParts = song.split('/')
      return urlParts[urlParts.length - 1] || 'Uploaded Song'
    }
    return song.file?.name || 'Audio File'
  }

  const getFileSize = () => {
    if (!song || typeof song === 'string') return null
    return song.file ? `${(song.file.size / (1024 * 1024)).toFixed(2)} MB` : null
  }

  return (
    <div style={{ width: '100%' }}>
      {songUrl && (
        <div
          style={{
            position: 'relative',
            marginBottom: '20px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.08) 0%, rgba(45, 27, 78, 0.03) 100%)',
            border: '2px solid rgba(45, 27, 78, 0.1)',
            boxShadow: '0 4px 20px rgba(45, 27, 78, 0.08)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(45, 27, 78, 0.12)'
            e.currentTarget.style.borderColor = 'rgba(45, 27, 78, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 27, 78, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(45, 27, 78, 0.1)'
          }}
        >
          {/* Hidden audio element */}
          {songUrl && <audio ref={audioRef} src={songUrl} preload="metadata" />}

          {/* Song Card Content */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              {/* Play Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2D1B4E 0%, #4A2C6B 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(45, 27, 78, 0.3)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(45, 27, 78, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(45, 27, 78, 0.3)'
                }}
              >
                <CIcon 
                  icon={isPlaying ? cilMediaPause : cilMediaPlay} 
                  size="xl"
                  style={{ marginLeft: isPlaying ? '0' : '2px' }}
                />
              </button>

              {/* Song Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CIcon icon={cilMusicNote} className="text-purple" size="sm" />
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#2D1B4E',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getFileName()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  {getFileSize() && (
                    <>
                      <span style={{ color: '#E5E0E8' }}>•</span>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>{getFileSize()}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={handleRemoveSong}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'
                  e.currentTarget.style.color = '#dc3545'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title="Remove song"
              >
                <CIcon icon={cilTrash} size="sm" />
              </button>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(45, 27, 78, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={(e) => {
                const audio = audioRef.current
                if (!audio) return
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = (e.clientX - rect.left) / rect.width
                audio.currentTime = percent * audio.duration
              }}
            >
              <div
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #2D1B4E 0%, #4A2C6B 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.1s linear',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#2D1B4E',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleSongChange}
          style={{ display: 'none' }}
          id="song-upload"
          ref={fileInput}
        />
        <CButton
          color="primary"
          onClick={() => fileInput.current.click()}
          style={{
            borderRadius: '12px',
            padding: '12px 24px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(45, 27, 78, 0.2)',
            transition: 'all 0.3s ease',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 27, 78, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 27, 78, 0.2)'
          }}
        >
          <CIcon icon={cilMusicNote} className="me-2" />
          {song ? 'Change Song' : 'Upload Song'}
        </CButton>
        {!song && (
          <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic' }}>
            Select an audio file (MP3, WAV, etc.)
          </div>
        )}
      </div>
    </div>
  )
}

export default SongUpload
