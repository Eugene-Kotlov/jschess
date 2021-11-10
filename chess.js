/*
 * MIT License
 * 
 * Copyright (c) 2021 Kotlov Eugene
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

{
    var cx,cs,th=[Math.random()*360,30,80],col=[],
        dd={mx: 0,my: 0,ms: 127,f: 127,n: 0,pm: 1,es: 2,et: 0,s: 0,ss: 0}
    const shape=[[0,13,9,13,9,9,4,3,3,-1,7,-1,2,-5,4,-8,3,-11,2,-12],
    [0,14,11,13,10,9,8,7,12,0,13,-5,11,-9,8,-11,4,-10,0,-7,0,0],
    [0,14,10,13,8,8,10,5,12,0,11,-8,-2,-14,-2,-12,-11,-5,-9,0,-2,-2,0,-3,-2,-2,-6,3,-5,8,-10,13],
    [0,10,1,12,11,13,9,9,5,7,7,1,8,-4,7,-8,3,-11,1,-12,2,-14,0,-15],
    [0,13,10,13,9,9,7,8,6,-6,9,-7,9,-12,6,-12,5,-9,2,-9,2,-12],
    [0,14,11,13,10,9,8,7,12,-5,14,-5,14,-8,11,-8,11,-6,6,-1,6,-11,7,-11,7,-14,4,-14,4,-11,5,-11,0,-2]]

    function draw_piece(p,x,y,c=p&1,z=shape[p>>=4],s=dd.s,h=z.length,m=2,n=h/2) {
        cx.fillStyle=c? "#fff":"#000"
        cx.strokeStyle=c? "#000":"#fff"
        cx.lineWidth=s/2
        cx.beginPath()
        cx.moveTo(z[0]*s+x,z[1]*s+y)
        for(;n--;)cx.lineTo(z[m++]*s+x,z[m++]*s+y)
        for(p=p!=2,m=p*h,n=p*h/2+1;n--;)cx.lineTo((1-p*2)*z[m--]*s+x,z[m--+2]*s+y)
        cx.fill()
        cx.stroke()
    }

    function mousemove(e) {
        dd.mx=e.pageX-cs.offsetLeft
        dd.my=e.pageY-cs.offsetTop
        dd.ms=dd.mx/dd.ss|0+dd.my/dd.ss<<4
        if(nodes[dd.n].pos[dd.f]) draw()
    }

    function mouseup() {
        for(let i=0,n=nodes[dd.n];i<n.mn;i++) {
            gen_moves(n)
            remove_illegal(n)
            if((n.ml[i]&255)==dd.f&&n.ml[i]>>8==dd.ms) {
                do_move(n,n.ml[i])
                dd.n++
                break
            }
        }
        dd.f=NULL_SQ
        draw()
    }

    function mousedown() {
        let n=nodes[dd.n]
        if(n.pos[dd.ms]) {
            dd.f=dd.ms
            gen_moves(n)
            remove_illegal(n)
            draw()
        }
    }

    function keydown(e) {
        if(e.code=='KeyM') dd.es=3-dd.es
        for(let i=10;i--;)if(e.code=="Digit"+i) lvl=i
        draw()
    }

    function resize() {
        cs.width=document.documentElement.clientWidth
        cs.height=document.documentElement.clientHeight
        dd.ss=Math.min(cs.width,cs.height)/8
        dd.s=dd.ss/32
        draw()
    }

    function draw(i=0,j,n=nodes[dd.n],p=n.pos,s=dd.ss,h=s/3,f,r) {
        cx.fillStyle=col[2]
        cx.fillRect(0,0,cx.canvas.width,cx.canvas.height)
        do {
            cx.fillStyle=col[(i^i>>4)&1]
            cx.fillRect(f=(i&7)*s,r=(i>>4)*s,s,s)
            if(p[i]&&i!=dd.f) draw_piece(p[i],f+s/2,r+s/2)
            for(cx.fillStyle=col[2],j=n.mn;j--&&dd.pm;)
                if(n.ml[j]>>8==i&&((n.ml[j]&255)==dd.f)) cx.fillRect(f+h,r+h,h,h)
        } while(i=i+9&119)
        if(f=n.pos[dd.f]) draw_piece(f,dd.mx,dd.my)
    }

    const start_pos="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const ph=[1,0,3,7,11,23],pm=146,
        dir=[-16,-15,-17,0,0,0,0,0,16,15,17,0,0,0,0,0,
        -15,15,-17,17,-1,1,-16,16,0,0,0,0,0,0,0,0,
        -14,14,-18,18,-31,31,-33,33,0,0,0,0,0,0,0,0,
        -15,15,-17,17,0,0,0,0,0,0,0,0,0,0,0,0,
        -1,1,-16,16,0,0,0,0,0,0,0,0,0,0,0,0,
        -15,15,-17,17,-1,1,-16,16,0],
        WPAWN=0x00,BPAWN=0x08,KING=0x10,KNIGHT=0x20,BISHOP=0x30,ROOK=0x40,QUEEN=0x50,VIR=0x04,NULL_SQ=0x7F,
        pw=[0,WPAWN,BPAWN,0],
        val=[5,8,0,0,20,21,27,28,42,49,88,88],
        hp=[
            0x00000000,0x7deeffff,0x3588aa87,0x15454322,0x04342211,0x15331211,0x05312222,0x00000000,
            0x8b981343,0x889a5776,0x9bb96886,0x68874777,0x57533577,0x77303567,0xa9622456,0x9c750233,
            0x074a0254,0x68fc3657,0xafff4588,0xbcff6899,0xaccd5799,0x9bcc5678,0x87ba3567,0x49783355,
            0x25020011,0x28861121,0x69b92222,0x679a2233,0x68791233,0x78871223,0x78870112,0x45550101,
            0x887a2222,0x88cc2211,0x6a981111,0x45891111,0x35560011,0x25550000,0x05550000,0x44670111,
            0x14555566,0x32632558,0x55652458,0x11325768,0x22223768,0x23223354,0x12431102,0x00120211]

    var pst=Array.from(Array(128),() => new Int16Array(128)),nodes=[],root,nodes_count,lvl=4

    function node(i) {
        this.pos=new Uint8Array(128)
        this.ksq=new Uint8Array(4)
        this.ml=new Uint16Array(256)
        this.mn=0
        this.turn=this.ep=this.fmr=0
        this.ph=this.mg=this.eg=0
        this.next=i
    }

    function init_node(n,i=0,p) {
        n.mg=n.eg=n.ph=0
        do if(p=n.pos[i]) {
            n.mg+=pst[p][i]
            n.eg+=pst[p][i+8]
            n.ph+=ph[p>>4]
        } while(i=i+9&119)
    }

    function init_pst(n,i=120,j,r=-88,p) {
        let m=new node(0)
        fen2pos(m,start_pos)
        while(i--) n.pos[i]==m.pos[i]&&r++
        r=r<2? 2:r
        for(i=128;i--;)for(p=i>>4,j=128;j--;)
            if(p<6&&!(j&136)) {
                var k=2,c=i&1,f=j&7,h=hp[(p<<3)+(j>>4)]
                if(f&4) f=~f&7
                j=c? j:j^112
                for(c=c? 10:-10;k--;)
                    pst[i][j+k*8]=((val[p*2+k]+(h>>(28-(f+k*4<<2))&15))*c+r/2-r*Math.random())|0
            }
    }

    function fen2pos(n,f,p,j=0) {
        f=f.split(" ")
        n.pos.fill(0)
        n.turn=f[1][0]=="w"? 1:2
        var t=n.turn-1
        n.ph=n.mg=n.eg=0
        f[0].replace(/\//g,'8').split('').forEach(i => {
            if(p=Number(i)) j+=p; else {
                i="PpKkNnBbRrQq".indexOf(i)
                p=i==1? BPAWN:i>>1<<4
                i=i%2+1
                if(p==KING) n.ksq[i]=j
                if((p==WPAWN&&(j>>4)==6)||(p==BPAWN&&(j>>4)==1)) p|=VIR
                n.pos[j++]=p+i
            }
        })
        "KkQq".split('').forEach(i => {
            if((i=f[2].indexOf(i))>=0) {
                n.pos[n.ksq[i%2+1]]|=VIR
                n.pos[[119,7,112,0][i]]|=VIR
            }
        })
        n.ep=f[3][0]=='-'? NULL_SQ:"abcdefgh".indexOf(f[3][0])-Number(f[3][1])*16+128
        n.fmr=Number(f[4])
    }

    let sq2str=(s) => "abcdefgh"[s&7]+(8-(s>>4))
    let move2str=(m) => sq2str(m&255)+sq2str(m>>8)

    function gen_moves(n) {
        let f=0,t,i,d,s,u=n.turn,p=n.pos,m=n.ml
        n.mn=0
        do if(p[f]&u) {
            d=p[f]&~7
            do for(t=f+dir[d];!(t&136||(s=p[t])&u);t+=dir[d]) {
                if(d<KING) {
                    if((i=dir[d]&1)&&!s||!i&&s) break
                    if(!i&&(p[f]&VIR)&&!p[i=t+dir[d]])
                        m[n.mn++]=f+(i<<8)
                }
                if(t==n.ksq[3-u]) return 0
                m[n.mn++]=f+(t<<8)
                if(s||d<BISHOP)
                    break
            } while(dir[++d])
        } while(f=f+9&119)
        if(p[f=n.ksq[u]]&VIR) {
            if((p[f+3]&VIR)&&!p[f+2]&&!p[f+1])
                m[n.mn++]=f+((f+2)<<8)
            if((p[f-4]&VIR)&&!p[f-3]&&!p[f-2]&&!p[f-1])
                m[n.mn++]=f+((f-2)<<8)
        }
        for(i=1;n.ep!=NULL_SQ&&i<3;i++)
            if(!((f=n.ep-dir[pw[u]+i])&136)&&!(p[f]&VIR)&&p[f]&&(p[f]&~7)==pw[u])
                m[n.mn++]=f+(n.ep<<8)
        if(n.ksq[0]) for(i=n.mn;i--;)if((t=m[i]>>8)==n.ksq[0]||t==n.ksq[3]) return 0
        return 1
    }

    let remove_illegal=(n,m=n.ml) => {for(var i=0;i<n.mn;i++)if(!gen_moves(do_move(n,m[i]))) m[i--]=m[n.mn-- -1]}

    function sort_moves(n,i=0,j=0,k,p=n.pos,m=n.ml) {
        for(;i<n.mn;i++)if(p[m[i]>>8]) {k=m[j]; m[j++]=m[i]; m[i]=k}
        while(--j>0) for(i=0;i<j;) {
            let f=m[i++],s=m[i]
            if((p[f>>8]<<8)-p[f&255]<(p[s>>8]<<8)-p[s&255]) {m[i-1]=s; m[i]=f}
        }
    }

    function do_move(n,t) {
        nodes_count++
        var d=nodes[n.next],p=d.pos,q=n.pos,a,b,i=0,f=t&255,u=n.turn
        t>>=8

        do p[i]=q[i]; while(i=i+9&119)
        d.ksq=[0,n.ksq[1],n.ksq[2],0]
        d.fmr++
        d.turn=3-u
        d.ep=0
        d.ph=n.ph
        d.mg=n.mg
        d.eg=n.eg

        a=q[f]
        b=q[t]

        d.mg+=pst[a&~VIR][t]-pst[a][f]
        d.eg+=pst[a&~VIR][t+8]-pst[a][f+8]
        if(b) {
            d.fmr=0
            d.ph-=ph[b>>4]
            d.mg-=pst[b][t]
            d.eg-=pst[b][t+8]
        }

        p[t]=a&~VIR
        p[f]=0

        b=t-f
        if(a<KING) {
            d.fmr=0
            if(t>103||t<8) {
                p[t]=QUEEN+u
                d.ph+=ph[5]-ph[0]
                d.mg+=pst[p[t]][t]-pst[a][t]
                d.eg+=pst[p[t]][t+8]-pst[a][t+8]
            } else if(b==32||b==-32) d.ep=f+(b>>1)
            else if(t==n.ep) {
                i=t-dir[a&~7]
                d.ph-=ph[0]
                d.mg-=pst[p[i]][i]
                d.eg-=pst[p[i]][i+8]
                p[i]=0
            }
        } else if((a&~7)==KING) {
            d.ksq[u]=t
            if(b==2||b==-2) {
                if(b==2) {a=f+1; b=f+3}
                else {a=f-1; b=f-4}
                d.ksq[0]=f
                d.ksq[3]=a
                i=p[b]
                d.mg+=pst[i&~VIR][a]-pst[i][b]
                d.eg+=pst[i&~VIR][a+8]-pst[i][b+8]
                p[a]=ROOK+u
                p[b]=0
            }
        }
        return d
    }

    function search(n,a,b,d) {
        var q=--d<0,i,j,s,nn
        if(q) {
            s=(n.ph*n.mg+(pm-n.ph)*n.eg)/pm<<0
            s=n.turn==1? s:-s
            if(s>=b) return s
            if(s>a) a=s
        }
        if(n.fmr>100) return 0
        sort_moves(n)
        for(i=0,j=0;i<n.mn&&(!q||n.pos[n.ml[i]>>8]);i++)
            if(gen_moves(nn=do_move(n,n.ml[i]))) {
                s=-search(nn,-b,-a,d)
                if(s>=b) return s
                if(s>a) a=s
                j++
            }
        if(!j&&!q) {
            n.turn=3-n.turn
            if(gen_moves(n)) a=0
            a=n.next-root-1e4
        }
        return a
    }

    function pick_move(n,d,a=-1e4,b=-a,bm=0,i=256,s,nn,m=n.ml) {
        nodes_count=0
        root=n.next-1
        init_pst(n)
        init_node(n)
        gen_moves(n)
        remove_illegal(n)
        sort_moves(n)
        if(!n.mn||(bm=m[0])==1) return bm
        var start=new Date().getTime()
        for(i=0;i<n.mn;i++) {
            gen_moves(nn=do_move(n,m[i]))
            s=-search(nn,-b,-a,d)
            if(s>a) {
                a=s
                bm=m[i]
                if(a>=b) break
            }
        }
        var time=new Date().getTime()-start
        console.log("info depth",d,"score cp",s=n.turn==1? s:-s,"time",time,"nodes",nodes_count,"nps",nodes_count/time*1000<<0,"pv",move2str(bm))
        console.log("bestmove",move2str(bm))
        return bm
    }

    function engine_move(n=nodes[dd.n]) {
        if(dd.es!=n.turn) return 0
        if(dd.et<2) {dd.et++; draw(); return 0}
        let m=pick_move(n,lvl)
        if(m) do_move(n,m,dd.n++)
        dd.et=0
        draw()
    }

    function main() {
        cs=document.getElementById('canvas')
        cx=cs.getContext('2d')
        document.body.style.overflow="hidden"
        cs.addEventListener('mousemove',mousemove)
        cs.addEventListener('mousedown',mousedown)
        cs.addEventListener('mouseup',mouseup)
        window.addEventListener('keydown',keydown)
        window.addEventListener('resize',resize)
        for(let i=3;i--;)col[i]="hsl("+th[0]+","+th[1]+"%,"+(th[2]-th[2]/10*i)+"%)"
        for(let i=256;i--;)nodes[i]=new node((i+1)&255)
        fen2pos(nodes[0],start_pos)
        init_pst(nodes[0])
        resize()
        setInterval(engine_move,10)
    }
}