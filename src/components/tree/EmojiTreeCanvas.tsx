import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Rect, Circle, Triangle, Path, Shadow } from "fabric";
import { supabase } from "@/integrations/supabase/client";
import { AddOrnamentDialog } from "./AddOrnamentDialog";
import { ViewOrnamentDialog } from "./ViewOrnamentDialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Ornament {
  id: string;
  emoji: string;
  nickname: string;
  passcode_hash: string;
  note: string | null;
  position_x: number;
  position_y: number;
}

// Helper to create star path
function createStarPath(cx: number, cy: number, innerRadius: number, outerRadius: number): string {
  const points = 5;
  let path = "";
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + " Z";
}

export const EmojiTreeCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrnament, setSelectedOrnament] = useState<Ornament | null>(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

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

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = Math.min(container.clientWidth - 32, 600);
    const height = Math.min(500, window.innerHeight * 0.5);

    setDimensions({ width, height });

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "transparent",
      selection: false,
    });

    setFabricCanvas(canvas);
    drawTree(canvas, width, height);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Fetch ornaments on mount
  useEffect(() => {
    fetchOrnaments();
  }, [fetchOrnaments]);

  const drawTree = (canvas: FabricCanvas, width: number, height: number) => {
    const centerX = width / 2;
    const treeBottom = height - 50;
    const treeTop = 40;
    const treeHeight = treeBottom - treeTop;

    // Pinterest-style dusty pine colors
    const pineColors = ["#4B6E4F", "#3D5C41", "#5A7D5D", "#2E4A32"];

    // Draw rustic wooden trunk
    const trunk = new Rect({
      left: centerX - 20,
      top: treeBottom,
      fill: "#5D4037",
      width: 40,
      height: 50,
      selectable: false,
      evented: false,
    });
    canvas.add(trunk);

    // Draw layered pine branches
    const branchLayers = 5;
    for (let layer = 0; layer < branchLayers; layer++) {
      const layerProgress = layer / branchLayers;
      const layerY = treeTop + treeHeight * 0.15 + layerProgress * treeHeight * 0.75;
      const layerWidth = 50 + (1 - layerProgress * 0.8) * 180;

      for (let branch = 0; branch < 3; branch++) {
        const offsetX = (Math.random() - 0.5) * 15;
        const color = pineColors[Math.floor(Math.random() * pineColors.length)];

        const branchTriangle = new Triangle({
          left: centerX - layerWidth / 2 + offsetX,
          top: layerY - 30 - branch * 8,
          width: layerWidth,
          height: treeHeight / branchLayers + 40,
          fill: color,
          selectable: false,
          evented: false,
        });
        canvas.add(branchTriangle);
      }
    }

    // Add frosted snow patches
    for (let i = 0; i < 12; i++) {
      const snowY = treeTop + 40 + Math.random() * (treeHeight * 0.7);
      const progressFromTop = (snowY - treeTop) / treeHeight;
      const maxWidth = 40 + progressFromTop * 140;
      const snowX = centerX + (Math.random() - 0.5) * maxWidth;

      const snowPatch = new Circle({
        left: snowX,
        top: snowY,
        radius: 3 + Math.random() * 5,
        fill: "rgba(255, 255, 255, 0.6)",
        selectable: false,
        evented: false,
      });
      canvas.add(snowPatch);
    }

    // Add warm glowing lights
    const lightColors = ["#FDF3CD", "#FFE082", "#FFCC80", "#FFF8E1"];
    for (let i = 0; i < 15; i++) {
      const lightY = treeTop + 50 + Math.random() * (treeHeight * 0.75);
      const progressFromTop = (lightY - treeTop) / treeHeight;
      const maxWidth = 30 + progressFromTop * 130;
      const lightX = centerX + (Math.random() - 0.5) * maxWidth;

      const lightGlow = new Shadow({
        color: "rgba(255, 243, 205, 0.8)",
        blur: 12,
        offsetX: 0,
        offsetY: 0,
      });

      const light = new Circle({
        left: lightX,
        top: lightY,
        radius: 3 + Math.random() * 2,
        fill: lightColors[Math.floor(Math.random() * lightColors.length)],
        selectable: false,
        evented: false,
        shadow: lightGlow,
      });
      canvas.add(light);
    }

    // Add golden star on top
    const starGlow = new Shadow({
      color: "rgba(255, 215, 0, 0.7)",
      blur: 25,
      offsetX: 0,
      offsetY: 0,
    });

    const starPath = createStarPath(centerX, treeTop + 15, 10, 20);
    const topStar = new Path(starPath, {
      fill: "#D4AF37",
      selectable: false,
      evented: false,
      shadow: starGlow,
    });
    canvas.add(topStar);

    canvas.renderAll();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an existing ornament
    const clicked = ornaments.find((o) => {
      const dx = o.position_x - x;
      const dy = o.position_y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clicked) {
      setSelectedOrnament(clicked);
      setViewDialogOpen(true);
    } else {
      setClickPosition({ x, y });
      setAddDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Decorate the Tree
        </h2>
        <p className="text-muted-foreground font-display italic">
          Click to hang your emoji ornament with a private note 🔒
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-2xl p-4 shadow-soft w-full max-w-[640px]"
        style={{
          background: "linear-gradient(180deg, rgba(253, 243, 205, 0.1) 0%, rgba(75, 110, 79, 0.15) 100%)",
        }}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-pointer rounded-xl mx-auto block"
          />

          {/* Emoji ornaments overlay */}
          {ornaments.map((ornament) => (
            <button
              key={ornament.id}
              onClick={() => {
                setSelectedOrnament(ornament);
                setViewDialogOpen(true);
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-125 transition-transform cursor-pointer group"
              style={{
                left: ornament.position_x,
                top: ornament.position_y,
              }}
              title={ornament.nickname}
            >
              <span className="drop-shadow-lg">{ornament.emoji}</span>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs bg-background/90 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {ornament.nickname}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>{ornaments.length} ornaments on the tree</span>
      </div>

      <AddOrnamentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        position={clickPosition}
        onSuccess={fetchOrnaments}
      />

      <ViewOrnamentDialog
        ornament={selectedOrnament}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onUpdate={fetchOrnaments}
      />
    </div>
  );
};
