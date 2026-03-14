import { useEffect, useState, useCallback, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { supabase } from "@/integrations/supabase/client";
import { AddOrnamentDialog } from "./AddOrnamentDialog";
import { ViewOrnamentDialog } from "./ViewOrnamentDialog";
import { TreeSnowfall } from "./TreeSnowfall";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Star, Clock, Heart } from "lucide-react";
import { toast } from "sonner";
import watercolorTree from "@/assets/watercolor-tree.png";

interface Ornament {
  id: string;
  emoji: string;
  nickname: string;
  passcode_hash: string;
  note: string | null;
  position_x: number;
  position_y: number;
}

export const MagicalTreeHero = () => {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrnament, setSelectedOrnament] = useState<Ornament | null>(null);
  const [newOrnamentId, setNewOrnamentId] = useState<string | null>(null);
  const [treeDimensions, setTreeDimensions] = useState({ width: 400, height: 512 });
  const [filterMode, setFilterMode] = useState<"all" | "my" | "recent">("all");
  const [myOrnaments, setMyOrnaments] = useState<string[]>([]);

  // Fetch ornaments
  const fetchOrnaments = useCallback(async () => {
    const { data, error } = await supabase
      .from("ornaments")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching ornaments:", error);
      return;
    }

    setOrnaments(data || []);
  }, []);

  // Update ornament position in database
  const updateOrnamentPosition = async (id: string, x: number, y: number) => {
    const { error } = await supabase
      .from("ornaments")
      .update({ position_x: x, position_y: y })
      .eq("id", id);

    if (error) {
      console.error("Error updating position:", error);
      toast.error("Couldn't save position");
    }
  };

  // Get tree dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (treeContainerRef.current) {
        const img = treeContainerRef.current.querySelector("img");
        if (img) {
          setTreeDimensions({
            width: img.clientWidth,
            height: img.clientHeight,
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Fetch ornaments on mount
  useEffect(() => {
    fetchOrnaments();
    // Load my ornaments from local storage
    const saved = JSON.parse(localStorage.getItem('myOrnaments') || '[]');
    setMyOrnaments(saved);
  }, [fetchOrnaments]);

  const handleOrnamentAdded = async (newId?: string) => {
    await fetchOrnaments();
    
    if (newId) {
      setNewOrnamentId(newId);
      setMyOrnaments(prev => [...prev, newId]);
      setTimeout(() => setNewOrnamentId(null), 1000);
      return;
    }

    // Fallback Find the newest ornament to animate
    const { data } = await supabase
      .from("ornaments")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setNewOrnamentId(data[0].id);
      setTimeout(() => setNewOrnamentId(null), 1000);
    }
  };

  const handleDragStop = (ornamentId: string, e: DraggableEvent, data: DraggableData) => {
    // Calculate position relative to tree container
    const ornament = ornaments.find((o) => o.id === ornamentId);
    if (!ornament) return;

    const newX = ornament.position_x + data.x;
    const newY = ornament.position_y + data.y;

    // Clamp to tree bounds
    const clampedX = Math.max(20, Math.min(treeDimensions.width - 20, newX));
    const clampedY = Math.max(40, Math.min(treeDimensions.height - 40, newY));

    // Update local state immediately for smooth UX
    setOrnaments((prev) =>
      prev.map((o) =>
        o.id === ornamentId ? { ...o, position_x: clampedX, position_y: clampedY } : o
      )
    );

    // Persist to database
    updateOrnamentPosition(ornamentId, clampedX, clampedY);
  };

  // Generate a random starting position on the tree
  const getRandomTreePosition = () => {
    // Tree shape is roughly triangular, so we constrain positions accordingly
    const centerX = treeDimensions.width / 2;
    const y = 80 + Math.random() * (treeDimensions.height - 180);
    
    // Width increases as we go down the tree
    const progress = (y - 80) / (treeDimensions.height - 180);
    const maxOffset = 30 + progress * 140;
    const x = centerX + (Math.random() - 0.5) * maxOffset * 2;

    return { x: Math.round(x), y: Math.round(y) };
  };

  // Filter the ornaments
  const filteredOrnaments = ornaments.filter(ornament => {
    if (filterMode === "my") return myOrnaments.includes(ornament.id);
    if (filterMode === "recent") {
      // Show top 10 most recent
      const recentIds = ornaments.slice(-10).map(o => o.id);
      return recentIds.includes(ornament.id);
    }
    return true; // "all"
  });

  return (
    <section className="relative min-h-screen bg-[#FDF8F2] overflow-hidden pt-28 md:pt-32 lg:pt-40" id="decorate-tree">
      {/* Subtle snowfall */}
      <TreeSnowfall />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 lg:py-24 flex flex-col items-center">
        {/* Title section */}
        <div className="text-center mb-6 md:mb-8 max-w-2xl">
          <h1 className="font-elegant text-5xl md:text-7xl text-christmas-green mb-4">
            Decorate the Tree
          </h1>
          <p className="font-sans text-lg md:text-xl text-warm-grey/70 leading-relaxed mb-6">
            This season, every story belongs on the tree.
            <br />
            Add your memory and place it anywhere you like.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Button 
              variant={filterMode === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterMode("all")}
              className={`rounded-full ${filterMode === "all" ? "bg-christmas-green/90" : "text-foreground"}`}
            >
              <Star className="w-3 h-3 mr-1" /> All
            </Button>
            <Button 
              variant={filterMode === "my" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterMode("my")}
              className={`rounded-full ${filterMode === "my" ? "bg-ornament-cranberry/90" : "text-foreground"}`}
            >
              <Heart className="w-3 h-3 mr-1" /> My Ornaments
            </Button>
            <Button 
              variant={filterMode === "recent" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterMode("recent")}
              className={`rounded-full ${filterMode === "recent" ? "bg-ornament-gold/90 text-primary-foreground" : "text-foreground"}`}
            >
              <Clock className="w-3 h-3 mr-1" /> Recent
            </Button>
          </div>
        </div>

        {/* Tree container with ornaments */}
        <div
          ref={treeContainerRef}
          className="relative w-full max-w-[400px] md:max-w-[500px]"
        >
          {/* Watercolor tree image */}
          <img
            src={watercolorTree}
            alt="Watercolor Christmas tree"
            className="w-full h-auto pointer-events-none select-none"
            onLoad={() => {
              // Update dimensions after image loads
              if (treeContainerRef.current) {
                const img = treeContainerRef.current.querySelector("img");
                if (img) {
                  setTreeDimensions({
                    width: img.clientWidth,
                    height: img.clientHeight,
                  });
                }
              }
            }}
          />

          {/* Draggable ornaments overlay */}
          {filteredOrnaments.map((ornament) => (
            <DraggableOrnament
              key={ornament.id}
              ornament={ornament}
              isNew={newOrnamentId === ornament.id}
              isMine={myOrnaments.includes(ornament.id)}
              onDragStop={(e, data) => handleDragStop(ornament.id, e, data)}
              onClick={() => {
                setSelectedOrnament(ornament);
                setViewDialogOpen(true);
              }}
              containerWidth={treeDimensions.width}
              containerHeight={treeDimensions.height}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="mt-8 animate-gentle-pulse bg-gradient-to-r from-ornament-gold to-ornament-cranberry hover:from-ornament-cranberry hover:to-ornament-gold text-white font-sans font-semibold text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your Ornament
        </Button>

        {/* Ornament count */}
        <div className="flex items-center gap-2 mt-6 text-warm-grey/60 text-sm">
          <Sparkles className="w-4 h-4 text-candlelight animate-twinkle" />
          <span className="font-sans">
            {ornaments.length} {ornaments.length === 1 ? "memory" : "memories"} on the tree
          </span>
        </div>
      </div>

      {/* Dialogs */}
      <AddOrnamentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        position={getRandomTreePosition()}
        onSuccess={handleOrnamentAdded}
      />

      <ViewOrnamentDialog
        ornament={selectedOrnament}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onUpdate={fetchOrnaments}
      />
    </section>
  );
};

// Separate component for draggable ornament
interface DraggableOrnamentProps {
  ornament: Ornament;
  isNew: boolean;
  isMine?: boolean;
  onDragStop: (e: DraggableEvent, data: DraggableData) => void;
  onClick: () => void;
  containerWidth: number;
  containerHeight: number;
}

const DraggableOrnament = ({
  ornament,
  isNew,
  isMine,
  onDragStop,
  onClick,
  containerWidth,
  containerHeight,
}: DraggableOrnamentProps) => {
  const nodeRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSparkle, setShowSparkle] = useState(isNew);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isNew) {
      setShowSparkle(true);
      const timer = setTimeout(() => setShowSparkle(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: 0, y: 0 }}
      onStart={(e: DraggableEvent) => {
        setIsDragging(true);
        // Record starting position for touch devices
        if (e.type === "touchstart") {
          const touchEvent = e as unknown as React.TouchEvent;
          dragStartPos.current = {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY,
          };
        } else if (e.type === "mousedown") {
          const mouseEvent = e as unknown as React.MouseEvent;
          dragStartPos.current = {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
          };
        }
      }}
      onStop={(e: DraggableEvent, data: DraggableData) => {
        setIsDragging(false);
        onDragStop(e, data);
        
        // Calculate distance moved to differentiate drag from tap
        let endX = data.x, endY = data.y;
        if (e.type === "touchend") {
           const touchEvent = e as unknown as React.TouchEvent;
           if (touchEvent.changedTouches && touchEvent.changedTouches.length > 0) {
              endX = touchEvent.changedTouches[0].clientX;
              endY = touchEvent.changedTouches[0].clientY;
           }
        } else if (e.type === "mouseup") {
           const mouseEvent = e as unknown as React.MouseEvent;
           endX = mouseEvent.clientX;
           endY = mouseEvent.clientY;
        }

        const distance = Math.sqrt(
          Math.pow(endX - dragStartPos.current.x, 2) +
          Math.pow(endY - dragStartPos.current.y, 2)
        );

        // If moved less than 5 pixels, treat as a click
        if (distance < 5) {
          onClick();
        }
      }}
      bounds={{
        left: -ornament.position_x + 20,
        right: containerWidth - ornament.position_x - 20,
        top: -ornament.position_y + 40,
        bottom: containerHeight - ornament.position_y - 40,
      }}
    >
      <button
        ref={nodeRef}
        className={`absolute text-4xl cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-candlelight focus:ring-offset-2 rounded-full p-1 transition-all duration-200 group ${
          isNew ? "animate-ornament-fall" : ""
        } ${isDragging ? "scale-110 z-50" : "hover:scale-110"}`}
        style={{
          left: ornament.position_x,
          top: ornament.position_y,
          transform: "translate(-50%, -50%)",
          filter: isDragging
            ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
        aria-label={`Ornament by ${ornament.nickname}. Drag to reposition or click to view.`}
      >
        <span className="relative">
          {ornament.emoji}

          {/* Sparkle effect for new ornaments */}
          {showSparkle && (
            <span className="absolute -top-2 -right-2 text-lg animate-sparkle-burst">
              ✨
            </span>
          )}

          {/* "My" Ornament Indicator */}
          {isMine && !showSparkle && (
            <span className="absolute -bottom-1 -right-1 text-xs bg-card rounded-full shadow-sm border border-border">
              💖
            </span>
          )}
        </span>

        {/* Tooltip */}
        <span
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#FFF8E1] text-warm-grey text-xs font-handwritten rounded-lg whitespace-nowrap border border-candlelight/20 shadow-md transition-opacity ${
            isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {ornament.nickname}
        </span>
      </button>
    </Draggable>
  );
};
