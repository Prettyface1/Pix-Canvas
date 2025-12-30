;; PixelCanvas - Interactive NFT Canvas Gaming Platform
;; A decentralized platform for collaborative pixel art creation

;; ============================================
;; Constants
;; ============================================
(define-constant ADMIN tx-sender)
(define-constant GRID_DIMENSION u100)
(define-constant MINT_COST u1000)
(define-constant ENGAGEMENT_BONUS u100)

;; ============================================
;; Error Codes
;; ============================================
(define-constant ERR_ACCESS_DENIED (err u100))
(define-constant ERR_OUT_OF_BOUNDS (err u101))
(define-constant ERR_ALREADY_MINTED (err u102))
(define-constant ERR_PAYMENT_FAILED (err u103))

;; ============================================
;; State Variables
;; ============================================
(define-data-var minted-count uint u0)
(define-data-var distributed-rewards uint u0)

;; ============================================
;; Data Structures
;; ============================================
;; Stores individual pixel data
(define-map canvas-state 
    { x: uint, y: uint }
    {
        creator: principal,
        rgb: (string-utf8 7),
        timestamp: uint,
        engagement: uint
    }
)

;; Tracks participant metrics
(define-map participant-metrics
    principal
    {
        owned-pixels: uint,
        earned-rewards: uint
    }
)

;; ============================================
;; Helper Functions
;; ============================================
(define-read-only (get-canvas-pixel (x uint) (y uint))
    (map-get? canvas-state {x: x, y: y})
)

(define-read-only (get-participant-data (user principal))
    (default-to 
        { owned-pixels: u0, earned-rewards: u0 }
        (map-get? participant-metrics user)
    )
)

(define-read-only (validate-coordinates (x uint) (y uint))
    (and 
        (< x GRID_DIMENSION)
        (< y GRID_DIMENSION)
    )
)

;; ============================================
;; Core Functions
;; ============================================

(define-public (mint-pixel (x uint) (y uint) (rgb (string-utf8 7)))
    (let
        (
            (participant tx-sender)
            (existing-pixel (get-canvas-pixel x y))
        )
        (asserts! (validate-coordinates x y) ERR_OUT_OF_BOUNDS)
        (asserts! (is-none existing-pixel) ERR_ALREADY_MINTED)
        (try! (stx-transfer? MINT_COST participant ADMIN))
        
        ;; Register pixel
        (map-set canvas-state 
            {x: x, y: y}
            {
                creator: participant,
                rgb: rgb,
                timestamp: block-height,
                engagement: u0
            }
        )
        
        ;; Update participant stats
        (let
            ((current-metrics (get-participant-data participant)))
            (map-set participant-metrics
                participant
                {
                    owned-pixels: (+ (get owned-pixels current-metrics) u1),
                    earned-rewards: (get earned-rewards current-metrics)
                }
            )
        )
        
        (var-set minted-count (+ (var-get minted-count) u1))
        (ok true)
    )
)

(define-public (modify-pixel (x uint) (y uint) (new-rgb (string-utf8 7)))
    (let
        (
            (participant tx-sender)
            (pixel-data (unwrap! (get-canvas-pixel x y) ERR_OUT_OF_BOUNDS))
        )
        (asserts! (validate-coordinates x y) ERR_OUT_OF_BOUNDS)
        (asserts! (is-eq (get creator pixel-data) participant) ERR_ACCESS_DENIED)
        
        (map-set canvas-state
            {x: x, y: y}
            {
                creator: participant,
                rgb: new-rgb,
                timestamp: block-height,
                engagement: (get engagement pixel-data)
            }
        )
        (ok true)
    )
)

(define-public (engage-with-pixel (x uint) (y uint))
    (let
        (
            (participant tx-sender)
            (pixel-data (unwrap! (get-canvas-pixel x y) ERR_OUT_OF_BOUNDS))
            (pixel-creator (get creator pixel-data))
        )
        (asserts! (not (is-eq participant pixel-creator)) ERR_ACCESS_DENIED)
        
        ;; Update engagement metrics
        (map-set canvas-state
            {x: x, y: y}
            {
                creator: pixel-creator,
                rgb: (get rgb pixel-data),
                timestamp: (get timestamp pixel-data),
                engagement: (+ (get engagement pixel-data) u1)
            }
        )
        
        ;; Distribute engagement bonus
        (try! (stx-transfer? ENGAGEMENT_BONUS ADMIN pixel-creator))
        
        ;; Update creator metrics
        (let
            ((creator-metrics (get-participant-data pixel-creator)))
            (map-set participant-metrics
                pixel-creator
                {
                    owned-pixels: (get owned-pixels creator-metrics),
                    earned-rewards: (+ (get earned-rewards creator-metrics) ENGAGEMENT_BONUS)
                }
            )
        )
        
        (var-set distributed-rewards (+ (var-get distributed-rewards) ENGAGEMENT_BONUS))
        (ok true)
    )
)

;; ============================================
;; Administrative Functions
;; ============================================
(define-public (admin-withdraw (amount uint))
    (begin
        (asserts! (is-eq tx-sender ADMIN) ERR_ACCESS_DENIED)
        (try! (stx-transfer? amount ADMIN tx-sender))
        (ok true)
    )
)