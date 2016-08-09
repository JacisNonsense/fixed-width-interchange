// Generated by CoffeeScript 1.10.0
(function() {
  var FWI, IEEE754toBytes, bytesToIEEE754, exports, fromDouble, fromFloat, toDouble, toFloat,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  exports = function() {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      return module.exports;
    }
    if (typeof window !== 'undefined') {
      return window.FWI;
    }
    if (typeof FWI !== 'undefined') {
      return FWI;
    }
  };

  if (typeof window !== 'undefined') {
    window.FWI = {};
  }

  IEEE754toBytes = function(v, bytes, offset, double_precise) {
    var bias, e_width, exp, j, ln, m_width, mant, mant_1, mant_2, n, ref, sign;
    e_width = 8;
    m_width = 23;
    if (double_precise) {
      e_width = 11;
      m_width = 52;
    }
    bias = (1 << (e_width - 1)) - 1;
    sign;
    exp;
    mant;
    if (isNaN(v)) {
      exp = (1 << bias) - 1;
      mant = 1;
      sign = 0;
    } else if (v === Infinity || v === -Infinity) {
      exp = (1 << bias) - 1;
      mant = 0;
      sign = v < 0 ? 1 : 0;
    } else if (v === 0) {
      exp = 0;
      mant = 0;
      sign = 0;
    } else {
      sign = v < 0 ? 1 : 0;
      if (v < 0) {
        v = -v;
      }
      if (v >= Math.pow(2, 1 - bias)) {
        ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
        exp = ln + bias;
        mant = Math.floor(v * Math.pow(2, m_width - ln) - Math.pow(2, m_width));
      } else {
        exp = 0;
        mant = Math.floor(v / Math.pow(2, 1 - bias - m_width));
      }
    }
    for (n = j = 0, ref = (double_precise ? 8 : 4); 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
      bytes[offset + n] = 0;
    }
    if (double_precise) {
      if (sign === 1) {
        bytes[offset + 7] = 1 << 7;
      }
      bytes[offset + 7] |= exp >> 4;
      bytes[offset + 6] |= (exp & 0xf) << 4;
      mant_1 = mant | 0;
      if (mant_1 < 0) {
        mant_1 += 4294967296;
      }
      mant_2 = mant - mant_1;
      mant_2 /= 4294967296;
      bytes[offset + 6] |= (mant_2 >> 16) & 0xf;
      bytes[offset + 5] |= (mant_2 >> 8) & 0xff;
      bytes[offset + 4] |= mant_2 & 0xff;
      bytes[offset + 3] |= (mant_1 >> 24) & 0xff;
      bytes[offset + 2] |= (mant_1 >> 16) & 0xff;
      bytes[offset + 1] |= (mant_1 >> 8) & 0xff;
      bytes[offset] |= mant_1 & 0xff;
    } else {
      if (sign === 1) {
        bytes[offset + 3] = 1 << 7;
      }
      bytes[offset + 3] |= exp >> 1;
      bytes[offset + 2] |= (exp & 1) << 7;
      bytes[offset + 2] |= (mant >> 16) & 0x7f;
      bytes[offset + 1] |= (mant >> 8) & 0xff;
      bytes[offset] |= mant & 0xff;
    }
    return void 0;
  };

  bytesToIEEE754 = function(bytes, offset, double_precise) {
    var a, b, byt, c, d, e, exp, exp_bits, expoff, f, g, h, i, j, m_base, man_bits, man_bits_2, mant, n, push, ref, sign;
    a = bytes[offset];
    b = bytes[offset + 1];
    c = bytes[offset + 2];
    d = bytes[offset + 3];
    e;
    f;
    g;
    h;
    if (double_precise) {
      e = bytes[offset + 4];
      f = bytes[offset + 5];
      g = bytes[offset + 6];
      h = bytes[offset + 7];
    }
    man_bits = a | b << 8 | c << 16;
    man_bits_2 = 0;
    sign = 1;
    exp_bits = 0;
    exp = 1;
    m_base = 0;
    expoff = 127;
    if (double_precise) {
      expoff = 1023;
    }
    if (double_precise) {
      exp_bits = g | h << 8;
      sign = (h & (1 << 7)) !== 0 ? -1 : 1;
      exp = (exp_bits >> 4 & 0x7ff) - expoff;
      man_bits_2 = d | e << 8 | f << 16 | g << 24;
      m_base = 52;
    } else {
      exp_bits = c | d << 8;
      sign = (d & (1 << 7)) !== 0 ? -1 : 1;
      exp = (exp_bits >> 7 & 0xff) - expoff;
      m_base = 23;
    }
    mant = 1.0;
    if (exp === -127) {
      mant = 0.0;
      exp = -126;
    }
    for (n = j = 1, ref = m_base; 1 <= ref ? j <= ref : j >= ref; n = 1 <= ref ? ++j : --j) {
      i = Math.pow(2, -n);
      byt = m_base - n;
      push = false;
      if (byt >= 24) {
        push = (man_bits_2 & (1 << byt - 24)) !== 0;
      } else {
        push = (man_bits & (1 << byt)) !== 0;
      }
      if (push) {
        mant += i;
      }
    }
    if (exp === 128 && mant === 1.0) {
      return sign * Infinity;
    }
    if (exp === 128 && mant > 1) {
      return NaN;
    }
    if (exp + expoff === 0 && mant === 1.0) {
      return 0;
    }
    return sign * Math.pow(2, exp) * mant;
  };

  toFloat = (function(_this) {
    return function(bytes, offset) {
      return bytesToIEEE754(bytes, offset, false);
    };
  })(this);

  toDouble = (function(_this) {
    return function(bytes, offset) {
      return bytesToIEEE754(bytes, offset, true);
    };
  })(this);

  fromFloat = (function(_this) {
    return function(bytes, offset, value) {
      return IEEE754toBytes(value, bytes, offset, false);
    };
  })(this);

  fromDouble = (function(_this) {
    return function(bytes, offset, value) {
      return IEEE754toBytes(value, bytes, offset, true);
    };
  })(this);

  FWI = {};

  FWI.util = {};

  FWI.util.exports = exports;

  FWI.util.extend = function(child, parent) {
    var ctor, key;
    for (key in parent) {
      if ({}.hasOwnProperty.call(parent, key)) {
        child[key] = parent[key];
      }
    }
    ctor = function() {
      this.constructor = child;
      return this;
    };
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };

  FWI.create_block_type = function(name, size) {
    var placeholder;
    placeholder = {};
    placeholder[name] = function() {
      return placeholder[name].__super__.constructor.call(this, size);
    };
    FWI.util.extend(placeholder[name], FWI.Block);
    return placeholder[name];
  };

  FWI.ByteBuffer = (function() {
    function ByteBuffer() {
      this.bytes = null;
      this.length = 0;
    }

    ByteBuffer.prototype.allocate = function(size) {
      var j, num, ref;
      this.bytes = [];
      this.length = size;
      for (num = j = 0, ref = this.length; 0 <= ref ? j < ref : j > ref; num = 0 <= ref ? ++j : --j) {
        this.bytes[num] = 0;
      }
      return void 0;
    };

    ByteBuffer.prototype.map_to_string = function(string) {
      var cc, j, num, ref, results;
      results = [];
      for (num = j = 0, ref = this.length; 0 <= ref ? j < ref : j > ref; num = 0 <= ref ? ++j : --j) {
        cc = string.charCodeAt(num);
        if (cc === NaN) {
          cc = 0;
        }
        results.push(this.bytes[num] = cc);
      }
      return results;
    };

    ByteBuffer.prototype.free = function() {
      this.bytes = null;
      this.length = 0;
      return void 0;
    };

    return ByteBuffer;

  })();

  FWI.Block = (function() {
    function Block(size) {
      this.get_i64 = bind(this.get_i64, this);
      this.set_i64 = bind(this.set_i64, this);
      this.get_u64 = bind(this.get_u64, this);
      this.set_u64 = bind(this.set_u64, this);
      this.size = size;
      this.buf = null;
      this.children = {};
      this.off = 0;
    }

    Block.prototype.update_children = function() {
      var bindex, child, child_i;
      for (child_i in this.children) {
        child = this.children[child_i];
        bindex = Number(child_i) + this.off;
        child.map_to(this.buf, bindex);
      }
      return void 0;
    };

    Block.prototype.allocate = function() {
      this.buf = new FWI.ByteBuffer;
      this.buf.allocate(this.size);
      this.off = 0;
      this.update_children();
      return void 0;
    };

    Block.prototype.from_string = function(string) {
      this.buf.map_to_string(string);
      return void 0;
    };

    Block.prototype.map_to = function(buffer, offset) {
      this.buf = buffer;
      this.off = offset;
      this.update_children();
      return void 0;
    };

    Block.prototype.get_bytes = function() {
      var i, j, ref, tmpbuf;
      tmpbuf = [];
      for (i = j = 0, ref = this.size; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        tmpbuf[i] = this.buf.bytes[this.off + i];
      }
      return tmpbuf;
    };

    Block.prototype.free = function() {
      this.buf = null;
      this.off = 0;
      return void 0;
    };

    Block.prototype.get_child = function(type, index) {
      var bindex, child;
      bindex = index + this.off;
      if (this.children[index] != null) {
        return this.children[index];
      } else {
        child = new type;
        child.map_to(this.buf, bindex);
        this.children[index] = child;
        return child;
      }
    };

    Block.prototype.set_bool = function(byte, bit, value) {
      byte += this.off;
      this.buf.bytes[Math.floor(byte)] ^= (-(value ? 1 : 0) ^ this.buf.bytes[byte]) & (1 << bit);
      return void 0;
    };

    Block.prototype.get_bool = function(byte, bit) {
      return (this.buf.bytes[Math.floor(byte) + this.off] & (1 << bit)) !== 0;
    };

    Block.prototype.set_u8 = function(byte, val) {
      this.buf.bytes[byte + this.off] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_u8 = function(byte) {
      return this.buf.bytes[byte + this.off];
    };

    Block.prototype.set_i8 = function(byte, val) {
      this.buf.bytes[byte + this.off] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_i8 = function(byte) {
      var byt;
      byt = this.buf.bytes[byte + this.off];
      if (byt > 127) {
        byt -= 256;
      }
      return byt;
    };

    Block.prototype.set_u16 = function(index, val) {
      var bindex;
      val &= 0xffff;
      bindex = index + this.off;
      this.buf.bytes[bindex + 1] = (val >> 8) & 0xff;
      this.buf.bytes[bindex] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_u16 = function(index) {
      var bindex;
      bindex = index + this.off;
      return this.buf.bytes[bindex] | (this.buf.bytes[bindex + 1] << 8);
    };

    Block.prototype.set_i16 = function(index, val) {
      var bindex;
      val &= 0xffff;
      bindex = index + this.off;
      this.buf.bytes[bindex + 1] = (val >> 8) & 0xff;
      this.buf.bytes[bindex] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_i16 = function(index) {
      var bindex, u16_val;
      bindex = index + this.off;
      u16_val = this.buf.bytes[bindex] | (this.buf.bytes[bindex + 1] << 8);
      if (u16_val > 32767) {
        u16_val -= 65536;
      }
      return u16_val;
    };

    Block.prototype.set_u32 = function(index, val) {
      var bindex;
      val &= 0xffffffff;
      bindex = index + this.off;
      this.buf.bytes[bindex + 3] = (val >> 24) & 0xff;
      this.buf.bytes[bindex + 2] = (val >> 16) & 0xff;
      this.buf.bytes[bindex + 1] = (val >> 8) & 0xff;
      this.buf.bytes[bindex] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_u32 = function(index) {
      var bindex;
      bindex = index + this.off;
      return this.buf.bytes[bindex] | (this.buf.bytes[bindex + 1] << 8) | (this.buf.bytes[bindex + 2] << 16) | (this.buf.bytes[bindex + 3] << 24);
    };

    Block.prototype.set_i32 = function(index, val) {
      var bindex;
      val &= 0xffffffff;
      bindex = index + this.off;
      this.buf.bytes[bindex + 3] = (val >> 24) & 0xff;
      this.buf.bytes[bindex + 2] = (val >> 16) & 0xff;
      this.buf.bytes[bindex + 1] = (val >> 8) & 0xff;
      this.buf.bytes[bindex] = val & 0xff;
      return void 0;
    };

    Block.prototype.get_i32 = function(index) {
      var bindex, u32_val;
      bindex = index + this.off;
      u32_val = this.buf.bytes[bindex] | (this.buf.bytes[bindex + 1] << 8) | (this.buf.bytes[bindex + 2] << 16) | (this.buf.bytes[bindex + 3] << 24);
      if (u32_val > 2147483647) {
        u32_val -= 4294967296;
      }
      return u32_val;
    };

    Block.prototype.set_u64 = function(index, val) {
      return this.set_u32(index, val);
    };

    Block.prototype.get_u64 = function(index) {
      return this.get_u32(index);
    };

    Block.prototype.set_i64 = function(index, val) {
      return this.set_i32(index, val);
    };

    Block.prototype.get_i64 = function(index) {
      return this.get_i32(index);
    };

    Block.prototype.set_string = function(index, val, length) {
      var i, j, k, ref, ref1;
      for (i = j = 0, ref = Math.min(val.length, length); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.buf.bytes[this.off + index + i] = val.charCodeAt(i);
      }
      if (val.length < length) {
        for (i = k = 0, ref1 = length - val.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          this.buf.bytes[this.off + index + val.length + i] = 0;
        }
      }
      return void 0;
    };

    Block.prototype.get_string = function(index, length) {
      var i, j, ref, res;
      res = "";
      for (i = j = 0, ref = length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        res += String.fromCharCode(this.buf.bytes[this.off + index + i]);
      }
      return res;
    };

    Block.prototype.get_float32 = function(index) {
      return toFloat(this.buf.bytes, index + this.off);
    };

    Block.prototype.get_float64 = function(index) {
      return toDouble(this.buf.bytes, index + this.off);
    };

    Block.prototype.set_float32 = function(index, value) {
      return fromFloat(this.buf.bytes, index + this.off, value);
    };

    Block.prototype.set_float64 = function(index, value) {
      return fromDouble(this.buf.bytes, index + this.off, value);
    };

    return Block;

  })();

  exports().ByteBuffer = FWI.ByteBuffer;

  exports().Block = FWI.Block;

  exports().util = FWI.util;

  exports().block = FWI.create_block_type;

}).call(this);
